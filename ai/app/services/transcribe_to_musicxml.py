from pathlib import Path
import subprocess, re, copy, html, shutil, os
import xml.etree.ElementTree as ET
from typing import Dict, Union, List
from webvtt import WebVTT

import music21 as m21

# ======================================================================
# 나중에 옮겨야 할 config
# ======================================================================

# musescore.exe 위치
MSCORE_PATH = Path(os.getenv("MSCORE_PATH", "/usr/bin/mscore3"))
# MSCORE_PATH: Path = Path(r"C:\Users\SSAFY\Downloads\MuseScorePortable\App\MuseScore\bin\MuseScore3.exe")
if not MSCORE_PATH.exists():
    raise FileNotFoundError(f"MuseScore path not found: {MSCORE_PATH}")

m21.environment.set("musicxmlPath", str(MSCORE_PATH))


_STEP_TO_SEMITONE = dict(zip('C D E F G A B'.split(),
                             (0, 2, 4, 5, 7, 9, 11)))

# ======================================================================
# musescore cli 함수
# ======================================================================

# musescore 실행 : midi -> musicxml
def _run_musescore_cli(src_midi: Path, dst_xml: Path, timeout: int = 120) -> None:
    # MuseScore CLI 인자 구성
    #   -o <출력파일> <입력파일>
    cmd = [str(MSCORE_PATH), "-o", str(dst_xml), str(src_midi)]

    # MuseScore 실행 및 예외 처리
    try:
        completed = subprocess.run(
            cmd,
            check=True,  # 비정상 종료 시 CalledProcessError 발생
            timeout=timeout,  # 지정 시간 초과 시 TimeoutExpired 발생
            capture_output=True  # stdout/stderr를 캡처해 디버깅 용도로 보관
        )
        print(f"✅ {src_midi.name} → {dst_xml.name} 변환 완료")

    except subprocess.TimeoutExpired:
        print(f"⏰ MuseScore가 {timeout} 초 내에 종료되지 않았습니다.")
        raise
    except subprocess.CalledProcessError as e:
        print(f"❌ MuseScore 변환 실패 – 반환 코드 {e.returncode}")
        print(f"stderr:{e.stderr.decode('utf-8', errors='ignore')}")
        raise
    except FileNotFoundError:
        print(f"❗ MuseScore 실행 파일을 찾을 수 없습니다: {MSCORE_PATH}")
        raise


# ======================================================================
# 음표 관련 악보 편집
# ======================================================================

# 첫 마디 비우기
def _empty_first_measure_xml(src_xml: Union[str, Path],
                             dst_xml: Union[str, Path, None] = None) -> Path:
    """
    MusicXML 파일의 첫 번째 완전 마디(보통 number="1")를
    measure-wide rest 한 개만 남기고 비웁니다.
    - 기존 note(음표·쉼표)는 모두 제거
    - rest 에는 measure="yes" 속성을 달아 둡니다.
    """
    src = Path(src_xml)
    dst = Path(dst_xml or src)

    tree = ET.parse(src)
    root = tree.getroot()
    # 네임스페이스 헬퍼
    m = re.match(r'\{([^}]+)\}', root.tag)
    ns = m.group(1) if m else ''
    q = lambda t: f'{{{ns}}}{t}' if ns else t

    # 1) 첫 번째 number>=1 마디 찾기
    first_meas = None
    for meas in root.findall(f'.//{q("measure")}'):
        num = meas.get('number')
        if num is not None and int(num) >= 1:
            first_meas = meas
            break
    if first_meas is None:
        # 비정상 구조면 그대로 저장
        tree.write(dst, encoding='utf-8', xml_declaration=True)
        return dst

    # 2) divisions, time signature 읽기
    attr = first_meas.find(q('attributes'))
    # 만약 attributes가 없으면 찾아서 생성
    if attr is None:
        attr = ET.SubElement(first_meas, q('attributes'))

    div_el = attr.find(q('divisions'))
    divisions = int(div_el.text) if div_el is not None else 1

    time_el = attr.find(q('time'))
    if time_el is not None:
        beats = int(time_el.find(q('beats')).text)
        beat_type = int(time_el.find(q('beat-type')).text)
    else:
        # 기본 4/4
        beats, beat_type = 4, 4

    # MusicXML에서 duration 단위는 divisions per quarter-note
    # 전체 마디 길이(quarterLength) = beats * (4/beat_type)
    # duration = divisions * quarterLength
    quarter_length = beats * (4 / beat_type)
    duration_val = int(divisions * quarter_length)

    # 3) 기존 note 요소 모두 제거
    for note_el in list(first_meas.findall(q('note'))):
        first_meas.remove(note_el)

    # 4) 전쉼표(note/rest) 하나 삽입
    note_el = ET.SubElement(first_meas, q('note'))
    rest_el = ET.SubElement(note_el, q('rest'))
    rest_el.set('measure', 'yes')
    dur_el = ET.SubElement(note_el, q('duration'))
    dur_el.text = str(duration_val)

    # 5) 저장
    tree.write(dst, encoding='utf-8', xml_declaration=True)
    return dst


# 첫 마디 삭제
def delete_first_measures_xml(
    src_xml: Union[str, Path],
    dst_xml: Union[str, Path, None] = None,
    n: int = 1,
) -> Path:
    """
    첫 완전 마디 n개 삭제하되,
    ─ 삭제할 마디 중 *가장 마지막* 마디의 <attributes> 블록을
      새 첫 마디(삭제 뒤 1번 마디)에 **삽입**하여
      clef / key / time / staff-details 가 유지되도록 한다.
    """
    src = Path(src_xml)
    dst = Path(dst_xml or src)

    tree = ET.parse(src)
    root = tree.getroot()
    ns_match = re.match(r"\{([^}]+)\}", root.tag)
    ns = ns_match.group(1) if ns_match else ""
    q = lambda t: f"{{{ns}}}{t}" if ns else t

    # ── 1) 삭제 대상 인덱스 찾기 (첫 part 기준) ─────────────────
    first_part = root.find(q("part"))
    measures   = first_part.findall(q("measure"))
    del_idx    = [i for i, m in enumerate(measures)
                  if int(m.get("number", "0").split()[0]) >= 1][:n]

    if not del_idx:
        tree.write(dst, encoding="utf-8", xml_declaration=True)
        return dst

    # ── 2) 복사해 둘 <attributes> 확보 (가장 마지막 삭제 마디 기준) ──
    attrs_to_copy = None
    for tag in (q("attributes"),):
        for m_i in reversed(del_idx):
            cand = measures[m_i].find(tag)
            if cand is not None:
                attrs_to_copy = ET.fromstring(ET.tostring(cand))
                break
        if attrs_to_copy is not None:
            break

    # ── 3) 모든 part에서 같은 인덱스 measure 삭제 ────────────────
    for part in root.findall(q("part")):
        part_measures = part.findall(q("measure"))
        for i in sorted(del_idx, reverse=True):
            if i < len(part_measures):
                part.remove(part_measures[i])

        # ── 4) 남은 마디 번호 재시퀀싱 ───────────────────────────
        for new_no, meas in enumerate(part.findall(q("measure")), start=1):
            meas.set("number", str(new_no))

        # ── 5) 새 첫 마디에 <attributes> 삽입(이미 없을 때만) ───
        if attrs_to_copy is not None:
            first_after = part.find(q("measure"))
            if first_after is not None and first_after.find(q("attributes")) is None:
                first_after.insert(0, ET.fromstring(ET.tostring(attrs_to_copy)))

    tree.write(dst, encoding="utf-8", xml_declaration=True)
    return dst


# 마지막 마디 삭제
def delete_last_measures_xml(
    src_xml: Union[str, Path],
    dst_xml: Union[str, Path, None] = None,
    n: int = 1,
) -> Path:
    """
    MusicXML에서 ‘완전 마디’(number >= 1) 기준으로
    맨 끝에서 n개를 삭제하고, 번호를 1·2·… 순서로 다시 매긴다.
    - 반복기호·피네(barline repeat/fine) 등은 삭제된 마디와 함께 사라짐.
    - 끝 마디의 barline(종결선)은 자동으로 남은 마지막 마디에 이미 있으므로
      별도 복사 과정을 두지 않는다.
    """
    src = Path(src_xml)
    dst = Path(dst_xml or src)

    tree = ET.parse(src)
    root = tree.getroot()

    # 네임스페이스 헬퍼
    m = re.match(r"\{([^}]+)\}", root.tag)
    ns = m.group(1) if m else ""
    q = lambda t: f"{{{ns}}}{t}" if ns else t

    # ── 1) 모든 part 에 대해 동일 인덱스를 삭제하기 위해
    #      기준 part(첫 part)의 삭제 대상 인덱스 구하기 ──────────────
    first_part = root.find(q("part"))
    measures   = first_part.findall(q("measure"))

    # ‘완전 마디’(number ≥ 1) 인덱스만 수집
    full_idx = [i for i, m in enumerate(measures)
                if int(m.get("number", "0").split()[0]) >= 1]

    if len(full_idx) < n:
        n = len(full_idx)       # 요청 개수가 전체보다 크면 가능한 만큼만

    del_indices = full_idx[-n:]                       # 뒤에서 n개
    if not del_indices:
        return dst

    # ── 2) 모든 part에서 해당 measure 삭제 ────────────────────────
    for part in root.findall(q("part")):
        part_measures = part.findall(q("measure"))
        for i in sorted(del_indices, reverse=True):
            if i < len(part_measures):
                part.remove(part_measures[i])

        # ── 3) 남은 마디 번호 재시퀀싱 ───────────────────────────
        for new_no, meas in enumerate(part.findall(q("measure")), start=1):
            meas.set("number", str(new_no))

    # ── 4) 저장 ─────────────────────────────────────────────────
    tree.write(dst, encoding="utf-8", xml_declaration=True)
    return dst


# ======================================================================
# 음표 이외의 악보 편집
# ======================================================================

# 가사 추출 및 삽입
def _time_to_sec(ts: str) -> float:
    """'HH:MM:SS.mmm' 또는 'MM:SS.mmm' → 초(float)"""
    h, m, s = (['0'] + ts.split(':'))[-3:]          # 앞이 비면 0으로
    return int(h) * 3600 + int(m) * 60 + float(s)


def _extract_timed_syllables(vtt_path: Path) -> list[tuple[float, str]]:
    """
    [(start_sec, syllable), …] 반환
    한 캡션(자막) 문장이 N개의 단어(음절)라면
    N개의 튜플에 같은 start_sec 을 복제해 넣는다.
    """
    timed: list[tuple[float, str]] = []
    for cap in WebVTT().read(str(vtt_path)):
        start_sec = _time_to_sec(cap.start)
        # 태그 제거·엔티티 디코드 후 공백 분리
        text_clean = html.unescape(re.sub(r'<[^>]+>', '', cap.text)).strip()
        for syl in text_clean.split():
            timed.append((start_sec, syl))
    return timed


def attach_lyrics_by_absolute_time(
    score: m21.stream.Score,
    timed_sylls: list[tuple[float, str]],
    bpm: int,
) -> None:
    """
    절대 시각(초) 그대로 매핑:
    • notes + rests 모두 대상
    • 같은 시각(한 캡션 블록) 안에 여러 음절 → 공백으로 이어붙여 한 줄 lyric
    • lead-in 보정 없음
    """
    if not timed_sylls:
        return

    sec_per_ql = 60 / bpm
    elems      = list(score.parts[0].flatten().notesAndRests)  # ★ rests 포함
    elem_times = [e.offset * sec_per_ql for e in elems]

    idx = 0
    for el, et in zip(elems, elem_times):
        if idx >= len(timed_sylls):
            break

        chunk: list[str] = []
        while idx < len(timed_sylls) and timed_sylls[idx][0] <= et + 1e-6:
            chunk.append(timed_sylls[idx][1])
            idx += 1

        if chunk:
            el.lyric = " ".join(chunk)


# 불필요한 정보 숨기기
def clean_metadata(src_xml: Union[str, Path], dst_xml: Union[str, Path, None] = None) -> Path:
    """Strip title, creators, tempo marks, and credits from MusicXML."""

    src = Path(src_xml)
    dst = Path(dst_xml or src)

    tree = ET.parse(src)
    root = tree.getroot()

    ns_match = re.match(r"\{([^}]+)\}", root.tag)
    ns = ns_match.group(1) if ns_match else ""
    q = (lambda t: f"{{{ns}}}{t}") if ns else (lambda t: t)

    for node in list(root.findall(q("credit"))):
        root.remove(node)
    if (mt := root.find(q("movement-title"))):
        root.remove(mt)

    for ident in root.findall(q("identification")):
        for tag in ("creator", "rights"):
            for node in list(ident.findall(q(tag))):
                ident.remove(node)

    for direction in root.findall(".//" + q("direction")):
        for dtype in direction.findall(q("direction-type")):
            if dtype.find(q("metronome")) is not None:
                direction.clear()

    for tag in ("part-name", "part-abbreviation"):
        for node in root.findall(".//" + q(tag)):
            node.set("print-object", "no")

    tree.write(dst, encoding="utf-8", xml_declaration=True)
    return dst


# bpm 설정
def _set_tempo(score: m21.stream.Score, bpm: int) -> None:
    """악보에 BPM 설정"""
    # ── 1. 기존 템포 삭제 ───────────────────────────────────────────────
    for tempo in list(score.recurse().getElementsByClass(m21.tempo.MetronomeMark)):
        if tempo.activeSite:
            tempo.activeSite.remove(tempo)

    # ── 2. 새 MetronomeMark 생성 ───────────────────────────────────────
    new_tempo = m21.tempo.MetronomeMark(number=bpm)

    # Score 루트(모든 파트 공통)에도 한 번
    score.insert(0, copy.deepcopy(new_tempo))

    # 각 파트 첫 마디에도 삽입 (MusicXML viewer 호환성 확보)
    for part in score.parts:
        m1 = part.measure(1) or part.getElementsByClass(m21.stream.Measure).first()
        target = m1 if m1 is not None else part
        target.insert(0, copy.deepcopy(new_tempo))

# ======================================================================
# 악보 변환
# ======================================================================

# 타브 악보 변환 래퍼 함수
def _postprocess_bass_tab(xml_path: Path) -> None:
    """4현 베이스( E1 A1 D2 G2 )용 TAB 후처리"""
    _xml_to_tab_staff(xml_path, ['E1', 'A1', 'D2', 'G2'], staff_no=2)

def _postprocess_guitar_tab(xml_path: Path) -> None:
    """6현 기타( E2 A2 D3 G3 B3 E4 )용 TAB 후처리"""
    _xml_to_tab_staff(xml_path, ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'], staff_no=2)


def _name_to_midi(name: str) -> int:
    """
    'E2', 'F#3', 'Bb1' 같은 음이름을 MIDI(0~127)로.
    """
    m = re.match(r'^([A-G])([b#]?)(-?\d+)$', name)
    if not m:
        raise ValueError(f'Cannot parse pitch: {name}')
    step, accidental, octave = m.groups()
    semitone = _STEP_TO_SEMITONE[step]
    if accidental == '#':
        semitone += 1
    elif accidental == 'b':
        semitone -= 1
    midi = (int(octave) + 1) * 12 + semitone
    return midi % 128


def _pitch_xml_to_midi(pitch_el: ET.Element) -> int:
    step  = pitch_el.find('step').text
    alter = int(pitch_el.find('alter').text) if pitch_el.find('alter') is not None else 0
    octave = int(pitch_el.find('octave').text)
    semitone = _STEP_TO_SEMITONE[step] + alter
    return (octave + 1) * 12 + semitone


def _best_string_fret(midi: int, tuning_midis: list[int], max_fret: int = 24):
    """
    가능한 현·프렛 중 프렛이 가장 낮은 것을 선택.
    returns (1-based string, fret)  or  None
    """
    choices = [(idx + 1, midi - tm)              # 1-based string
               for idx, tm in enumerate(tuning_midis)
               if 0 <= midi - tm <= max_fret]
    return min(choices, key=lambda x: x[1]) if choices else None


def _xml_to_tab_staff(xml_path: Path, tuning: list[str], staff_no: int = 2) -> None:
    """
    MusicXML 파일에서 *마지막 part*의 `staff_no`만 TAB으로 만든다.
    (보컬+악기 듀오에서는 마지막 part가 악기로 들어오므로,
     단일 악기 파일에서도 동일하게 동작)
    """
    tree = ET.parse(xml_path)
    root = tree.getroot()

    # ── 네임스페이스 헬퍼 ───────────────────────────────────────────────
    ns_match = re.match(r'\{([^}]+)\}', root.tag)
    ns = ns_match.group(1) if ns_match else ''
    q = (lambda t: f'{{{ns}}}{t}') if ns else (lambda t: t)

    # ── ① ‘대상 part’ 선택: 가장 마지막 <part> ───────────────────────
    parts = root.findall(q('part'))
    if not parts:
        return  # 비어 있으면 패스
    target_part = parts[-1]           # ← 악기 part

    # ── ② 첫 마디(attributes) 잡기 ───────────────────────────────────
    first_meas = target_part.find(q('measure'))
    if first_meas is None:
        return
    attr = first_meas.find(q('attributes')) or ET.SubElement(first_meas, q('attributes'))

    # ── ③ staff-details / clef 추가 (TAB) ────────────────────────────
    staff_det = ET.SubElement(attr, q('staff-details'), number=str(staff_no))
    ET.SubElement(staff_det, q('staff-type')).text  = 'tablature'
    ET.SubElement(staff_det, q('staff-lines')).text = str(len(tuning))

    clef = ET.SubElement(attr, q('clef'), number=str(staff_no))
    ET.SubElement(clef, q('sign')).text  = 'TAB'
    ET.SubElement(clef, q('line')).text  = '5'

    # ④ TAB용 string/fret 달기 – ‘대상 part’의 note만 순회
    tuning_midis = [_name_to_midi(nm) for nm in tuning]

    for note in target_part.findall('.//' + q('note')):
        # ── (A) Staff 번호 강제 변경 ──────────────────────────────
        stf = note.find(q('staff'))
        if stf is None:
            stf = ET.SubElement(note, q('staff'))
        if stf.text != str(staff_no):
            stf.text = str(staff_no)

        # ── (B) rest / unpitched 건너뛰기 ────────────────────────
        pitch_el = note.find(q('pitch'))
        if pitch_el is None:
            continue

        # ── (C) string / fret 계산 및 삽입 ───────────────────────
        midi = _pitch_xml_to_midi(pitch_el)
        sf = _best_string_fret(midi, tuning_midis)
        if sf is None:
            continue

        string_num, fret = sf
        notat = note.find(q('notations')) or ET.SubElement(note, q('notations'))
        techn = notat.find(q('technical')) or ET.SubElement(notat, q('technical'))
        ET.SubElement(techn, q('string')).text = str(string_num)
        ET.SubElement(techn, q('fret')).text = str(fret)

        # ── (D) stem 숨기기 + beam 제거 ─────────────────────────
        (note.find(q('stem')) or ET.SubElement(note, q('stem'))).text = 'none'
        for beam_el in list(note.findall(q('beam'))):
            note.remove(beam_el)

    # ── ⑤ 저장 ────────────────────────────────────────────────────────
    tree.write(xml_path, encoding='utf-8', xml_declaration=True)


# 4마디 간격으로 줄바꿈
def insert_system_breaks_xml(
    src_xml: Union[str, Path],
    dst_xml: Union[str, Path, None] = None,
    bars_per_system: int = 4,
) -> Path:
    """
    5, 9, 13…(= 4n+1) 마디마다 <print new-system="yes"/> 삽입.
    모든 마디 번호는 MusicXML <measure number="…"> 값을 사용.
    이미 존재하는 <print> 는 one-shot 으로 정리해 중복 방지.

    Parameters
    ----------
    src_xml : 원본 MusicXML
    dst_xml : 저장 경로 (None → src 덮어쓰기)
    bars_per_system : 시스템 길이(기본 4마디)

    Returns
    -------
    Path : 저장된 파일 경로
    """
    src = Path(src_xml)
    dst = Path(dst_xml or src)

    tree = ET.parse(src)
    root = tree.getroot()

    # 네임스페이스 헬퍼
    m = re.match(r"\{([^}]+)\}", root.tag)
    ns = m.group(1) if m else ""
    q  = (lambda t: f"{{{ns}}}{t}") if ns else (lambda t: t)

    # ① 모든 measure 순회
    for meas in root.findall(f".//{q('measure')}"):
        num_attr = meas.get("number")
        try:
            num = int(num_attr.split()[0])          # '12' 또는 '12-13'
        except (TypeError, ValueError):
            continue                                # 번호 해석 못하면 건너뜀

        need_break = num >= 5 and (num - 1) % bars_per_system == 0

        # ② measure 안의 첫 <print> (없으면 None)
        first_print = None
        for child in meas:
            if child.tag == q("print"):
                first_print = child
                break

        if need_break:
            # ── new-system="yes" 달기 ──────────────────────────────
            if first_print is None:
                first_print = ET.Element(q("print"))
                meas.insert(0, first_print)
            first_print.set("new-system", "yes")
        else:
            # ── new-system 제거 (중복 방지) ────────────────────────
            if first_print is not None and "new-system" in first_print.attrib:
                del first_print.attrib["new-system"]
                # <print> 에 더 이상 속성이 없고 자식도 없다면 삭제
                if not first_print.attrib and len(list(first_print)) == 0:
                    meas.remove(first_print)

    # ③ 저장
    tree.write(dst, encoding="utf-8", xml_declaration=True)
    return dst


# 악보 합치기
def _clone_stream(src: m21.stream.Stream) -> m21.stream.Stream:
    """deepcopy 후 id · partName 중복 충돌을 피하도록 약간 수정"""
    new = copy.deepcopy(src)
    # music21 은 id 가 중복되어도 큰 문제는 없지만, 구분을 위해 보정
    new.id = (src.id or "Part") + "_copy"
    return new


def _combine_xml(vocal_xml: Path, instr_xml: Path, dst_xml: Path,
                 instr_id: str = "P2") -> None:
    """
    vocal_xml + instr_xml → dst_xml
    - vocal_xml : 보컬 1파트짜리 MusicXML (id="P1" 가정)
    - instr_xml : 악기 1파트짜리 MusicXML
    - dst_xml   : 결과(두 파트) MusicXML
    - instr_id  : 악기 파트에 부여할 새 id (기본 "P2")
    """
    # ── 1. 파싱 ──────────────────────────────
    v_tree  = ET.parse(vocal_xml)
    v_root  = v_tree.getroot()
    i_tree  = ET.parse(instr_xml)
    i_root  = i_tree.getroot()

    # 네임스페이스 헬퍼
    ns_match = re.match(r"\{([^}]+)\}", v_root.tag)
    ns = ns_match.group(1) if ns_match else ""
    q   = (lambda t: f"{{{ns}}}{t}") if ns else (lambda t: t)

    # ── 2. <part-list> 확보 ──────────────────
    part_list = v_root.find(q("part-list"))
    if part_list is None:
        # 엣지 케이스: 없는 경우 새로 만든다
        part_list = ET.Element(q("part-list"))
        v_root.insert(0, part_list)

    # ── 3. 악기 쪽 score-part / part 복사 ───
    # 3-1) score-part
    i_score_part = i_root.find(q("part-list")).find(q("score-part"))
    i_score_part_copy = ET.fromstring(ET.tostring(i_score_part))
    i_score_part_copy.set("id", instr_id)
    part_list.append(i_score_part_copy)

    # 3-2) part 본문
    i_part = i_root.find(q("part"))
    i_part_copy = ET.fromstring(ET.tostring(i_part))
    i_part_copy.set("id", instr_id)
    v_root.append(i_part_copy)

    # ── 4. 저장 ─────────────────────────────
    v_tree.write(dst_xml, encoding="utf-8", xml_declaration=True)


# ----------------------------------------------------------------------
# 메인 함수
# ----------------------------------------------------------------------
def midi_to_musicxml(
    bass_midi: str, drum_midi: str, guitar_midi: str,
    vocal_midi: str, lyric_vtt: str, save_path: str, bpm: int = 85,
) -> Dict[str, str]:

    # 출력 디렉토리
    sheet_dir = Path(save_path).expanduser().resolve() / "sheet_music"
    temp_dir = sheet_dir / ".temp"
    sheet_dir.mkdir(parents=True, exist_ok=True)
    temp_dir.mkdir(exist_ok=True)

    # ──────────────────────────────────────────────────────────────
    # 1) MIDI → (임시) MusicXML
    # ──────────────────────────────────────────────────────────────
    midis = {
        "vocal":  Path(vocal_midi),
        "bass":   Path(bass_midi),
        "drum":   Path(drum_midi),
        "guitar": Path(guitar_midi),
    }

    single_xml: Dict[str, Path] = {}  # 솔로 XML (듀오 합치기용)
    for part, midi_path in midis.items():
        if not midi_path.is_file():
            raise FileNotFoundError(f"{part} MIDI 파일이 없습니다: {midi_path}")

        tmp_xml = temp_dir / f"{part}.musicxml"

        if part == "vocal":
            m21.converter.parse(midi_path).write("musicxml", fp=tmp_xml)
        else:
            _run_musescore_cli(midi_path, tmp_xml)

        single_xml[part] = tmp_xml
    print("단일 악기.musicxml 생성 완료")
    
    # ──────────────────────────────────────────────────────────────
    # 2) 임시 XML → 최종 1-파트 XML
    # ──────────────────────────────────────────────────────────────
    timed_sylls = _extract_timed_syllables(Path(lyric_vtt)) if lyric_vtt else []

    for part, tmp_xml in single_xml.items():
        _empty_first_measure_xml(tmp_xml, tmp_xml)
        delete_first_measures_xml(tmp_xml)
        delete_last_measures_xml(tmp_xml)
        insert_system_breaks_xml(tmp_xml)

        if part == "vocal":
            sc = m21.converter.parse(tmp_xml)
            if timed_sylls:
                attach_lyrics_by_absolute_time(sc, timed_sylls, bpm)
            sc.write("musicxml", fp=tmp_xml)  # 덮어쓰기

    print("가사 매핑 완료")

    # ──────────────────────────────────────────────────────────────
    # 3) 보컬 + 악기 듀오 (music21 사용 X)
    # ──────────────────────────────────────────────────────────────
    id_map = {"bass": "P2", "drum": "P3", "guitar": "P4"}
    final_paths: Dict[str, str] = {}

    vocal_xml = single_xml["vocal"]
    final_paths["vocal"] = str(sheet_dir / "vocal.musicxml")
    shutil.copyfile(vocal_xml, final_paths["vocal"])  # 보컬 단독 저장

    for inst in ("bass", "drum", "guitar"):
        duo_xml = sheet_dir / f"{inst}.musicxml"  # bass.musicxml, drum.musicxml, ...
        _combine_xml(vocal_xml, single_xml[inst], duo_xml, instr_id=id_map[inst])
        clean_metadata(duo_xml)
        final_paths[inst] = str(duo_xml)

        if inst == "bass":
            _postprocess_bass_tab(duo_xml)     # staff 2 TAB
        elif inst == "guitar":
            _postprocess_guitar_tab(duo_xml)
            
    print("악보 합치기 및 타브 변환 완료")

    # 4) 임시 파일 정리
    for p in temp_dir.glob("*.musicxml"):
        p.unlink(missing_ok=True)
    temp_dir.rmdir()
    print("임시 파일 정리 완료")

    # 5) 마디 수 계산
    vocal_tree = ET.parse(final_paths["vocal"])
    vocal_root = vocal_tree.getroot()
    ns_match = re.match(r"\{([^}]+)\}", vocal_root.tag)
    ns = ns_match.group(1) if ns_match else ""
    q = (lambda t: f"{{{ns}}}{t}") if ns else (lambda t: t)

    measures = vocal_root.findall(f".//{q('measure')}")
    last_num_raw = measures[-1].get("number", "0") if measures else "0"

    # '12', '120-121', '99a' 등에서 맨 끝 숫자만 추출
    nums_in_str = re.findall(r"\d+", last_num_raw)
    measure_count = int(nums_in_str[-1]) if nums_in_str else 0

    print(f"마디 수 계산 완료. 마디 수 : {measure_count}")

    return final_paths, measure_count
