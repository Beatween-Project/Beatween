import os
import requests
import numpy as np
import soundfile as sf
import scipy.signal
from scipy.io.wavfile import write
from basic_pitch.inference import predict
import pretty_midi
import librosa
import mido
from mido import MidiFile, MidiTrack, MetaMessage  # ✅ 추가

def extract_bpm(audio_path: str) -> float:
    try:
        y, sr = librosa.load(audio_path)
        tempo, _ = librosa.beat.beat_track(y=y, sr=sr)

        bpm = tempo
        beat_duration = 60 / bpm  # 초
        click_duration = 0.05  # 클릭 사운드 길이

        # 짧은 '딱' 소리 생성
        t = np.linspace(0, click_duration, int(sr * click_duration), False)
        click = 0.5 * np.sin(2 * np.pi * 1000 * t)  # 1kHz 클릭음

        # 무음 삽입
        silence = np.zeros(int(sr * (beat_duration - click_duration)))
        beat = np.concatenate([click, silence])

        # 4박자 클릭
        click_track = np.tile(beat, 4)
        output_path = audio_path.replace("input", "click")
        write(output_path, sr, click_track.astype(np.float32))

        return float(tempo)
    except Exception as e:
        print(f"⚠️ BPM 추출 실패: {str(e)} → 기본값 120 사용")
        return 120.0

def change_bpm(input_path, output_path, new_bpm):
    mid = MidiFile(input_path)
    original_tempo = next(msg.tempo for track in mid.tracks for msg in track if msg.type == 'set_tempo')
    original_bpm = mido.tempo2bpm(original_tempo)
    scaling_factor = new_bpm / original_bpm

    new_mid = MidiFile(type=1)
    new_mid.ticks_per_beat = mid.ticks_per_beat

    # 메타 트랙 먼저 생성
    meta_track = MidiTrack()
    meta_track.append(MetaMessage('set_tempo', tempo=mido.bpm2tempo(new_bpm), time=0))
    meta_track.append(MetaMessage('time_signature', numerator=4, denominator=4, time=0))
    new_mid.tracks.append(meta_track)
    print(meta_track)

    for track in mid.tracks:
        new_track = MidiTrack()
        for msg in track:
            if msg.is_meta:
                print(msg)
                continue  # 메타는 이미 처리함
            else:
                new_time = int(round(msg.time * scaling_factor))
                new_track.append(msg.copy(time=new_time))
        new_mid.tracks.append(new_track)

    new_mid.save(output_path)

def get_wav_duration(file_path):
    with sf.SoundFile(file_path) as f:
        frames = f.frames
        samplerate = f.samplerate
        duration = frames / samplerate
    return duration

def add_dummy_note(input_midi_path, output_midi_path, end_time):
    # 1. MIDI 파일 로드
    midi = pretty_midi.PrettyMIDI(input_midi_path)
    
    # 2. 첫 번째 트랙 선택 (또는 새 트랙 생성)
    if midi.instruments:
        track = midi.instruments[0]  # 기존 트랙 사용
    else:
        track = pretty_midi.Instrument(program=0)  # 새 트랙 생성
        midi.instruments.append(track)
    
    # 3. 시작 부분에 더미 노트 추가 (E2, velocity=1, 0~0.01초)
    dummy_note = pretty_midi.Note(
        velocity=1,
        pitch=100,
        start=0.0,
        end=0.01
    )

    track.notes.insert(0, dummy_note)  # 첫 번째 위치에 삽입

    dummy_note = pretty_midi.Note(
        velocity=1,
        pitch=100,
        start=end_time-0.01,
        end=end_time
    )

    track.notes.append(dummy_note)


    # 4. 수정된 MIDI 파일 저장
    midi.write(output_midi_path)
    print(f"✅ 더미 노트 추가 완료: {output_midi_path}")

def preprocess_drum_audio(audio_path):
    y, sr = sf.read(audio_path)
    if len(y.shape) == 2:
        y = np.mean(y, axis=1)
    y_filtered = np.copy(y)
    y_filtered[np.abs(y_filtered) < 0.008] = 0
    return y_filtered, sr

def transcribe_drums_with_omnizart(drums_path: str, storage_path: str) -> dict:
    try:
        # 1. 오디오 전처리
        y_processed, sr = preprocess_drum_audio(drums_path)
        # 2. 임시 파일 저장
        temp_path = save_temp_wav(y_processed, sr, drums_path)
        rel_path = os.path.relpath(temp_path, storage_path)
        response = requests.post(
            "http://omnizart:5000/omnizart/drum",
            json={"filename": rel_path}
        )
        return response.json()["output_file"]
    
    except requests.RequestException as e:
        raise RuntimeError(f"Omnizart API error: {str(e)}")
    
def transcribe_music_with_omnizart(music_path: str, storage_path: str) -> dict:
    try:
        # 1. 오디오 전처리
        y_processed, sr = preprocess_guitar_audio(music_path)
        # 2. 임시 파일 저장
        temp_path = save_temp_wav(y_processed, sr, music_path)
        rel_path = os.path.relpath(temp_path, storage_path)
        response = requests.post(
            "http://omnizart:5000/omnizart/music",
            json={"filename": rel_path}
        )
        return response.json()["output_file"]
    
    except requests.RequestException as e:
        raise RuntimeError(f"Omnizart API error: {str(e)}")

def preprocess_audio(audio_path):
    """오디오 로드 + 완화된 필터링 (로우패스 완화 + 작은 잡음 컷)"""
    y, sr = sf.read(audio_path)

    # 스테레오를 모노로 변환
    if len(y.shape) == 2:
        y = np.mean(y, axis=1)

    # 1. 부드러운 로우패스 필터 (500Hz 이하만 유지)
    sos = scipy.signal.butter(4, 500, 'low', fs=sr, output='sos')
    y_filtered = scipy.signal.sosfilt(sos, y)

    # 2. Noise gate (약한 신호 제거)
    threshold = 0.003  # 너무 높이면 저역까지 날아가므로 낮게 설정
    y_filtered[np.abs(y_filtered) < threshold] = 0

    return y_filtered, sr

def save_temp_wav(y, sr, temp_path="temp_processed.wav"):
    sf.write(temp_path, y, sr)
    return temp_path

def filter_short_notes(note_events, min_duration=0.05):
    """너무 짧은 노트 제거"""
    return [note for note in note_events if (note[1] - note[0]) >= min_duration]

def remove_harmonic_overlaps(note_events, harmonic_distance=12, time_overlap=0.05):
    """겹치는 배음 제거 (예: 옥타브 배음 등)"""
    filtered_notes = []
    for note in note_events:
        start, end, pitch, confidence = note[:4]  # 여기 수정
        is_harmonic = False
        for other in filtered_notes:
            o_start, o_end, o_pitch, _ = other[:4]
            # 시간상 겹치고, 옥타브 관계일 경우
            if abs(start - o_start) < time_overlap and abs(pitch - o_pitch) in [harmonic_distance, harmonic_distance * 2]:
                if pitch > o_pitch:
                    is_harmonic = True
                break
        if not is_harmonic:
            filtered_notes.append(note)
    return filtered_notes


def note_events_to_midi(note_events, output_midi_path):
    midi = pretty_midi.PrettyMIDI()
    instrument = pretty_midi.Instrument(program=34)  # 34 = Electric Bass (pick)

    if not note_events:
        midi.instruments.append(instrument)
        midi.write(output_midi_path)
        return

    note_events = sorted(note_events, key=lambda x: x[0])

    for note in note_events:
        start, end, pitch, confidence = note[:4]
        if(start<0):
            continue
        velocity = int(confidence * 127)
        velocity = max(20, min(velocity, 127))

        midi_note = pretty_midi.Note(
            velocity=velocity,
            pitch=int(pitch),
            start=start,
            end=end
        )
        instrument.notes.append(midi_note)

    midi.instruments.append(instrument)
    midi.write(output_midi_path)

# ✅ main 함수에서 bpm 인자로 받기
def bass_audio_to_midi(input_audio_path, output_midi_path):
    print("[1] 오디오 전처리 중...")
    y_filtered, sr = preprocess_audio(input_audio_path)

    print("[2] 임시 파일 저장 중...")
    temp_path = save_temp_wav(y_filtered, sr, input_audio_path)

    print("[3] MIDI 변환 중...")
    model_output, midi_data, note_events = predict(temp_path)

    print(f"[4] 추출된 노트 수: {len(note_events)} → 필터링 중...")
    note_events = filter_short_notes(note_events, min_duration=0.05)
    note_events = remove_harmonic_overlaps(note_events)
    print(f"[5] 필터링 후 노트 수: {len(note_events)}")

    print("[6] MIDI 저장 중...")
    note_events_to_midi(note_events, output_midi_path)

    print(f"✅ 변환 완료! → {output_midi_path}")

    return output_midi_path

# 기타 채보
def preprocess_guitar_audio(audio_path):
    """기타 전용 오디오 전처리: 노이즈 게이트"""
    y, sr = sf.read(audio_path)
    if len(y.shape) == 2:
        y = np.mean(y, axis=1)
    y_filtered = np.copy(y)
    y_filtered[np.abs(y_filtered) < 0.002] = 0
    return y_filtered, sr

def filter_guitar_notes(note_events, min_duration=0.03):
    """짧은 노트 및 배음(7,12,19음 차이) 제거"""
    # 1. 짧은 노트 필터링
    filtered = [note for note in note_events if (note[1] - note[0]) >= min_duration]
    # 2. 배음 필터링
    final_notes = []
    for note in filtered:
        start, end, pitch, confidence = note[:4]
        conflict = False
        for existing in final_notes:
            e_start, e_end, e_pitch, _ = existing[:4]
            if abs(start - e_start) < 0.05 and abs(pitch - e_pitch) in [7, 12, 19]:
                conflict = True
                break
        if not conflict:
            final_notes.append(note)
    return final_notes

def create_guitar_midi(note_events, output_path):
    """MIDI 생성, 기타 사운드, 더미노트 추가"""
    midi = pretty_midi.PrettyMIDI()
    guitar = pretty_midi.Instrument(program=26)  # Acoustic Guitar tab
    
    if note_events:
        note_events = sorted(note_events, key=lambda x: x[0])
       
        for note in note_events:
            start, end, pitch, confidence = note[:4]
            if(start<0):
                continue
            velocity = int(confidence * 127)
            guitar.notes.append(pretty_midi.Note(
                velocity=max(20, min(velocity, 127)),
                pitch=int(pitch),
                start=start,
                end=end
            ))
    midi.instruments.append(guitar)
    midi.write(output_path)
    print(f"🎸 MIDI 생성 완료: {output_path}")

def guitar_audio_to_midi(input_path, output_path=None):
    """기타 오디오 → MIDI 변환 메인 함수"""
    try:
        # 1. 오디오 전처리
        y_processed, sr = preprocess_guitar_audio(input_path)
        # 2. 임시 파일 저장
        temp_path = save_temp_wav(y_processed, sr, input_path)
        
        # 3. Basic Pitch 예측
        model_output, midi_data, notes = predict(temp_path)

        # 4. 노트 필터링
        # filtered_notes = filter_guitar_notes(notes)
        # 5. MIDI 생성
        
        create_guitar_midi(notes, output_path)

        return output_path
    except Exception as e:
        print(f"❌ 오류 발생: {str(e)}")
        return None
    

def preprocess_vocal_audio(audio_path):
    """보컬 전용 오디오 전처리: 노이즈 게이트"""
    y, sr = sf.read(audio_path)
    if len(y.shape) == 2:
        y = np.mean(y, axis=1)
    y_filtered = np.copy(y)
    y_filtered[np.abs(y_filtered) < 0.002] = 0
    return y_filtered, sr

def create_vocal_midi(note_events, output_path):
    """MIDI 생성, 보컬 사운드, 더미노트 추가"""
    midi = pretty_midi.PrettyMIDI()
    vocal = pretty_midi.Instrument(program=26)  # vocal 
    if note_events:
        note_events = sorted(note_events, key=lambda x: x[0])
       
        for note in note_events:
            start, end, pitch, confidence = note[:4]
            if(start<0):
                continue
            velocity = int(confidence * 127)
            vocal.notes.append(pretty_midi.Note(
                velocity=max(20, min(velocity, 127)),
                pitch=int(pitch),
                start=start,
                end=end
            ))
    midi.instruments.append(vocal)
    midi.write(output_path)
    print(f" MIDI 생성 완료: {output_path}")

def vocal_audio_to_midi(input_path, output_path=None):
    """기타 오디오 → MIDI 변환 메인 함수"""
    try:
        # 1. 오디오 전처리
        y_processed, sr = preprocess_vocal_audio(input_path)
        # 2. 임시 파일 저장
        temp_path = save_temp_wav(y_processed, sr, input_path)
        
        # 3. Basic Pitch 예측
        model_output, midi_data, notes = predict(temp_path)

        # 5. MIDI 생성
        
        create_vocal_midi(notes, output_path)

        return output_path
    except Exception as e:
        print(f"❌ 오류 발생: {str(e)}")
        return None