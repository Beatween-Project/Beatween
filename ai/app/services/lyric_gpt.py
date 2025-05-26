from __future__ import annotations

from pathlib import Path
import os
import json
import re
from typing import List, Dict, Optional

from langdetect import detect
from openai import OpenAI, OpenAIError
from core.config import get_settings

# ──────────────────────────────────────────────
# 0. OpenAI 클라이언트 생성
# ──────────────────────────────────────────────
def _make_client() -> OpenAI:
    key = get_settings().OPENAI_API_KEY
    if not key:
        raise RuntimeError("환경변수 OPENAI_API_KEY 를 설정하세요.")
    return OpenAI(api_key=key)


GPT_MODEL = "gpt-4o-mini"

# ──────────────────────────────────────────────
# 1. 파일명에서 언어코드 추출 (.ko.vtt 등)
# ──────────────────────────────────────────────
_LANG_RE = re.compile(r"\.([a-z]{2,3}(?:-[A-Z]{2})?)\.vtt$", re.I)

def _lang_of(fp: Path) -> str:
    m = _LANG_RE.search(fp.name)
    return m.group(1).lower() if m else "und"

def _detect_song_lang(song_title: str) -> str:
    try:
        return detect(song_title)[:2].lower()
    except Exception:
        return "und"

# ──────────────────────────────────────────────
# 2. GPT 호출 래퍼
# ──────────────────────────────────────────────
def _call_gpt(
    client: OpenAI, messages: List[Dict[str, str]], model: str = GPT_MODEL
) -> str:
    print("GPT 호출 중…")
    try:
        resp = client.chat.completions.create(
            model=model, messages=messages, temperature=0.0
        )
    except OpenAIError as e:
        raise RuntimeError(f"OpenAI API 오류: {e}")

    return resp.choices[0].message.content.strip()

# ──────────────────────────────────────────────
# 3. 프롬프트 빌더
# ──────────────────────────────────────────────
# 가사가 있을 때
def _prompt_with_vtt(song_title: str, duration_sec: int, vtt_content: str) -> List[Dict[str, str]]:
    return [
        {
            "role": "system",
            "content": (
                f"""
                You are a lyric provider and caption formatter.

                When given:
                
                1. An incomplete WEBVTT file (may contain partial timestamps and fragments)
                2. The full official lyrics of the song : {song_title}
                3. The total duration of the song : {duration_sec}
                
                Your task:
                
                * Fetch the full official lyrics of {song_title} from the internet, and fill any missing lines.
                * Do not introduce duplicates (e.g., wrong: “가로등 불빛 아래 그 가로등 불빛 아래 그 골목길”; correct: “가로등 불빛 아래 그 골목길”)
                * Please consolidate any excessive duplicates into a single entry.
                * If the existing lyrics in the VTT are already completely accurate, leave them unchanged.
                * Please consolidate any excessive duplicates into a single entry:
                    - If the same lyric line appears in multiple consecutive or non-consecutive blocks, remove all but one occurrence.
                    - If those duplicate blocks have different timestamps, merge them into one block spanning from the earliest start time to the latest end time.
                * Produce a complete WEBVTT file spanning the entire song.
                * Return ONLY the finished WEBVTT string (no extra explanation).
                
                Example
                
                원본 파일
                ```
                00:00:13.000 --> 00:00:17.230 align:start position:0%
                 
                가로등<00:00:14.000><c> 불빛</c><00:00:14.480><c> 다에</c><00:00:15.320><c> 그</c>
                
                00:00:17.230 --> 00:00:17.240 align:start position:0%
                가로등 불빛 다에 그
                 
                
                00:00:17.240 --> 00:00:22.630 align:start position:0%
                가로등 불빛 다에 그
                골목길<00:00:18.240><c> 난</c><00:00:18.800><c> 몰래</c><00:00:19.800><c> 주어</c><00:00:20.720><c> 받았었던</c><00:00:21.720><c> 쪽지</c>
                ```
                
                인터넷에서 찾은 가사
                ```
                가로등 불빛 아래 그 골목길
                남몰래 주고 받았었던 쪽지
                ```
                
                변환 결과 (중복 제거)
                ```
                00:00:13.000 --> 00:00:17.230
                가로등 불빛 아래 그 골목길
                ```
                
                Warning: Do not change the timestamps if you are not modifying the content.

                """

            ),
        },
        {
            "role": "user",
            "content": json.dumps(
                {"song_title": song_title, "vtt_content": vtt_content},
                ensure_ascii=False,
            ),
        },
    ]


# 자동 생성 가사 없을 때
def _prompt_no_vtt(song_title: str, duration_sec: int) -> List[Dict[str, str]]:
    return [
        {
            "role": "system",
            "content": (
                f"""
                다음 vtt 파일을 반환한다.
                
                ```
                WEBVTT
                Kind: captions
                Language: ko
  
                00:00:00.000 --> 00:00:10.000
                가사 생성 불가
                ```

                """
            ),
        },
        {
            "role": "user",
            "content": json.dumps(
                {"song_title": song_title, "duration_sec": duration_sec},
                ensure_ascii=False,
            ),
        },
    ]

# ──────────────────────────────────────────────
# 4. 외부에서 호출할 메인 함수
# ──────────────────────────────────────────────
def update_lyrics_vtt(
    vtt_paths: List[str],
    song_title: str,
    duration_sec: int,
    vtt_official: bool,
) -> str:
    # ── 1) 사용할 VTT 선택 ───────────────────────
    song_lang = _detect_song_lang(song_title)
    selected: Optional[Path] = None
    priority_languages = ["ko", "en"]

    # 언어 우선순위에 따라 선택
    for lang in priority_languages:
        for p in vtt_paths:
            if _lang_of(Path(p)) == lang:
                selected = Path(p)
                break
        if selected:
            break
    if selected is None and vtt_paths:
        selected = Path(vtt_paths[0])          # 언어 안 맞으면 첫 번째

    # ── 2) GPT 클라이언트 ───────────────────────
    client = _make_client()

    # 공식 자막 존재 시 바로 반환
    if vtt_official and selected and selected.exists():
        print(f"공식 VTT 사용 → {selected.name}")
        return str(selected)

    if selected and selected.exists():
        print(f"선택된 자동생성 VTT 수정 → {selected.name}")
        prompt = _prompt_with_vtt(
            song_title, duration_sec, selected.read_text(encoding="utf-8")
        )
        target = selected
    else:
        # 새 VTT 생성
        print("VTT 없음 → 새로 생성")
        folder = Path(selected).parent if selected else Path(".")
        folder.mkdir(parents=True, exist_ok=True)
        target = folder / "final_lyrics.vtt"
        prompt = _prompt_no_vtt(song_title, duration_sec)

    # ── 3) GPT 호출 & 저장 ──────────────────────
    result = _call_gpt(client, prompt)

    # ── 코드 펜스 제거 (```vtt ... ``` 포함 시) ─────────────────
    if result.startswith("```"):
        # Strip leading and trailing fences
        lines = result.splitlines()
        # Remove opening fence line
        if lines and lines[0].startswith("```"):
            lines = lines[1:]
        # Remove closing fence line
        if lines and lines[-1].strip().startswith("```"):
            lines = lines[:-1]
        result = "\n".join(lines)

    target.write_text(result, encoding="utf-8")
    print(f"✅ VTT 저장 완료 → {target}")

    return str(target)