from fastapi import FastAPI, HTTPException, APIRouter
from pathlib import Path
from pydub import AudioSegment
from fastapi.middleware.cors import CORSMiddleware

import services.download_wav as dlw
import services.separate_wav as spw
import services.transcribe_to_midi as tcm
import services.upload_to_s3 as us3
from services.transcribe_to_musicxml import midi_to_musicxml
from services.lyric_gpt import update_lyrics_vtt

from schemas.request import YoutubeRequest
from schemas.response import CreateSheetResponse

import shutil

app = FastAPI()

api_router = APIRouter(prefix="/ai")

BASE_DIR = Path(__file__).parent.resolve()
STORAGE_PATH = BASE_DIR / ".." / "storage"
STORAGE_PATH.mkdir(parents=True, exist_ok=True)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["k12a205.p.ssafy.io:8080","localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@api_router.post("/transcription")
async def process_youtube(req: YoutubeRequest):
    try:
        # 1. 유튜브 오디오 다운로드
        print("유튜브 오디오 다운로드 시작")
        wav_info = dlw.download_youtube_audio(req.youtube_url, str(STORAGE_PATH))
        wav_path = wav_info["audio_file"]
        thumbnail_path = wav_info["thumbnail"]
        song_title = wav_info["title"]
        duration_sec = wav_info["duration_sec"]
        subtitle_paths = wav_info["subtitles"]
        vtt_official = wav_info["vtt_official"]
        print("유튜브 오디오 다운로드 완료")

        # 가사 생성
        print("가사 생성(gpt) 시작")
        vtt_path = update_lyrics_vtt(subtitle_paths, song_title, duration_sec, vtt_official)
        print("가사 생성 완료")

        uniq_name = dlw.extract_youtube_id(req.youtube_url)
        # bpm 추출
        bpm = int(tcm.extract_bpm(wav_path))
        print(f"bpm : {bpm}")

        # 2. 악기 분리
        print("악기 분리 시작")
        path_list = spw.separate_audio_with_demucs(wav_path, str(STORAGE_PATH))

        for stem in path_list:
            click = AudioSegment.from_wav(wav_path.replace("input", "click"))
            track = AudioSegment.from_wav(path_list[stem])
            new_track = click + track + click  # 앞뒤 클릭 삽입
            new_track.export(path_list[stem], format="wav")

        end_time = tcm.get_wav_duration(path_list["other"])
        print(f"악기 분리 완료 : path_list>{path_list}")
        
        # 3. 전사 요청
        print("midi 전사 시작")
        midi_results = {}
        # 드럼
        midi_results["drum"] = str(STORAGE_PATH)+ "/" + tcm.transcribe_drums_with_omnizart(path_list["drums"], str(STORAGE_PATH))
        print("드럼 전사 완료")
        # 베이스
        midi_results["bass"] = tcm.bass_audio_to_midi(path_list["bass"], path_list["bass"].replace(".wav", ".mid"))
        print("베이스 전사 완료")
        # 기타
        # results["guitar"] = str(STORAGE_PATH)+ "/" + tcm.transcribe_music_with_omnizart(path_list["other"], str(STORAGE_PATH))
        midi_results["guitar"] = tcm.guitar_audio_to_midi(path_list["other"], path_list["other"].replace(".wav", ".mid"))
        print("기타 전사 완료")
        # 보컬
        midi_results["vocal"] = tcm.vocal_audio_to_midi(path_list["vocals"], path_list["vocals"].replace(".wav", ".mid"))
        print("전체 전사 완료")

        # bpm 조정
        print("bpm 조정")
        for stem, xml_path in midi_results.items():
            print(stem)
            tcm.add_dummy_note(xml_path, xml_path, end_time)
            tcm.change_bpm(xml_path, xml_path, bpm)

        # 4. midi -> musicxml
        print("musicxml 변환 시작")
        musicxml_paths, measure_count = midi_to_musicxml(
            bass_midi=midi_results["bass"],
            drum_midi=midi_results["drum"],
            guitar_midi=midi_results["guitar"],
            vocal_midi=midi_results["vocal"],
            lyric_vtt=vtt_path,
            save_path=str(STORAGE_PATH),
            bpm=bpm,
        )
        print("musicxml 변환 완료")
        print(musicxml_paths)


        # musicxml S3 업로드
        print("S3 업로드 시작")
        s3_urls: dict[str, str] = {}
        for stem, xml_path in musicxml_paths.items():
            print(stem)
            s3_key = f"original_sheets/sheet_{uniq_name}_{stem}.musicxml"
            s3_urls[stem] = us3.upload_file(xml_path, s3_key)
            print(f"{stem}업로드 완료 : {s3_urls[stem]}")
        # 썸네일 S3 업로드
        if thumbnail_path:
            thumb_key = f"thumbnails/{uniq_name}{Path(thumbnail_path).suffix}"
            thumbnail_url = us3.upload_file(thumbnail_path, thumb_key)
            print(f"썸네일 업로드 완료 : {thumbnail_url}")
        else:
            thumbnail_url = None
        print("S3 업로드 완료")

        # storage 폴더 내의 모든 파일 삭제
        for item in STORAGE_PATH.iterdir():
            try:
                if item.is_dir():
                    # shutil.rmtree(item)  # 디렉터리 전체 삭제
                    pass
                else:
                    item.unlink()  # 파일 삭제
            except Exception as e:
                print(f"삭제 실패: {item!r} → {e}")

        return CreateSheetResponse(
            title=song_title,
            youtube_url=req.youtube_url,
            thumbnail_url=thumbnail_url,
            bpm=bpm,
            total_measures=measure_count,
            vocal_url=s3_urls.get("vocal"),
            guitar_url=s3_urls.get("guitar"),
            bass_url=s3_urls.get("bass"),
            drum_url=s3_urls.get("drum"),
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

app.include_router(api_router)