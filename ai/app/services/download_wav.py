import concurrent.futures
import functools
import os, re, json, glob, requests, mimetypes
from pathlib import Path
import yt_dlp

# 다양한 유튜브 URL 패턴을 지원하는 정규식
_YT_ID_RE = re.compile(r'(?:v=|\/)([0-9A-Za-z_-]{11})')


def _run_ydl(url: str, opts: dict, *, download: bool):
    """yt-dlp 호출을 별도 함수로 분리 – 스레드에서 실행될 대상"""
    with yt_dlp.YoutubeDL(opts) as ydl:
        return ydl.extract_info(url, download=download)


# YouTube ID 추출
def extract_youtube_id(url: str) -> str | None:
    match = _YT_ID_RE.search(url)
    return match.group(1) if match else None


# yt‑dlp .info.json → txt 저장
def _write_human_readable_meta(src_json: str, dst_txt: str) -> None:
    try:
        with open(src_json, encoding="utf-8") as f:
            meta = json.load(f)
    except FileNotFoundError:
        return

    keep = [
        "title",
        "uploader",
        "upload_date",
        "duration",
        "view_count",
        "like_count",
        "description",
    ]

    with open(dst_txt, "w", encoding="utf-8") as f:
        f.write(f"제목: {meta.get('title', 'N/A')}\n")
        f.write(f"업로더: {meta.get('uploader', 'N/A')}\n")
        f.write(f"업로드 날짜: {meta.get('upload_date', 'N/A')}\n")
        f.write(f"길이(초): {meta.get('duration', 'N/A')}\n")
        f.write(f"조회수: {meta.get('view_count', 'N/A')}\n")
        f.write(f"좋아요: {meta.get('like_count', 'N/A')}\n\n")
        f.write("설명:\n" + meta.get("description", "없음") + "\n\n추가 정보:\n")
        for k, v in meta.items():
            if k not in keep:
                f.write(f"{k}: {json.dumps(v, ensure_ascii=False)}\n")


# info 에서 최고 해상도 썸네일 하나 받아서 저장 후 경로 반환
def _download_thumbnail(info: dict, base_no_ext: Path) -> str | None:
    thumb_url: str | None = None
    if info.get("thumbnails"):
        thumb_url = max(info["thumbnails"], key=lambda t: t.get("width", 0)).get("url")
    elif info.get("thumbnail"):
        thumb_url = info["thumbnail"]

    if not thumb_url:
        return None

    try:
        resp = requests.get(thumb_url, timeout=10)
        resp.raise_for_status()

        ext = Path(thumb_url).suffix.lower()
        if ext not in {".jpg", ".jpeg", ".png", ".webp"}:
            ext = mimetypes.guess_extension(resp.headers.get("content-type", "")) or ".jpg"

        thumb_path = f"{base_no_ext}_thumb{ext}"
        with open(thumb_path, "wb") as f:
            f.write(resp.content)
        return thumb_path
    except Exception:
        return None


# 다운로더 메인 함수
def download_youtube_audio(youtube_url: str, storage_path: str, timeout_sec: int = 300) -> dict:
    """
    Returns (dict):
        title         (str)  : 영상 제목
        thumbnail     (str)  : 썸네일 이미지 경로 (없으면 None)
        duration_sec  (int)  : 영상 길이(초)
        audio_file    (str)  : WAV 오디오 경로
        subtitles     (list) : VTT 자막 경로 리스트 (없으면 [])
    """
    try:
        # ------------------------------------------------------------------
        # 1. 준비
        # ------------------------------------------------------------------
        # 저장 폴더 만들기
        Path(storage_path).mkdir(parents=True, exist_ok=True)
        print("저장 폴더 생성 완료")
        # 자막 우선순위
        langs = ("ko", "en", "en.*", "ja", "fr", "es.*", "de", "zh.*", "ru.*")
        # 파일 이름
        file_base = os.path.join(storage_path, "input")
        base_template = file_base + ".%(ext)s"
        wav_path = file_base + ".wav"

        # ------------------------------------------------------------------
        # 2. yt‑dlp
        # ------------------------------------------------------------------
        # 공통 옵션
        ydl_common_opts = {
            "outtmpl": base_template,
            "extractor_args": {"youtube": {"skip": ["translated_subs"]}},
            "subtitleslangs": list(langs),
            "subtitlesformat": "vtt",
            "postprocessors": [
                {"key": "FFmpegExtractAudio", "preferredcodec": "wav"},
            ],
            "quiet": True,
        }
        print("옵션 세팅 완료")

        # 시간 제한
        try:
            with concurrent.futures.ThreadPoolExecutor(max_workers=1) as ex:
                # 1차 시도 – 오디오 + 제작자(수동) 자막
                ydl_opts1 = ydl_common_opts | {
                    "format": "bestaudio/best",
                    "writesubtitles": True,
                    "writeautomaticsub": False,
                    "writeinfojson": True,
                }
                future1 = ex.submit(_run_ydl, youtube_url, ydl_opts1, download=True)
                info = future1.result(timeout=timeout_sec)  # ⏰ 5 분 제한

                vtt_official = bool(info.get("subtitles", {}))
            
                print("1차 다운로드 완료")

                # 자막 체크 → 없으면 2차로 자동 자막만 다운로드
                subtitle_files = glob.glob(file_base + "*.vtt")
                if not vtt_official:
                    ydl_opts2 = ydl_common_opts | {
                        "skip_download": True,
                        "writesubtitles": False,
                        "writeautomaticsub": True,
                    }
                    future2 = ex.submit(_run_ydl, youtube_url, ydl_opts2, download=False)
                    future2.result(timeout=timeout_sec)  # 🕔 다시 5 분 제한
                    subtitle_files = glob.glob(file_base + "*.vtt")

                    print("2차 다운로드 완료")
        except concurrent.futures.TimeoutError:
            raise RuntimeError("5 분 안에 다운로드가 끝나지 않았습니다. 곡 또는 url에 문제가 있습니다.")
        except Exception as e:
            raise RuntimeError(f"YouTube download failed: {e}")

        # 섬네일 다운로드
        thumbnail_path = _download_thumbnail(info, Path(file_base))
        print("썸네일 다운로드 완료")

        # 메타데이터 txt 생성
        _write_human_readable_meta(f"{file_base}.info.json", f"{file_base}_info.txt")
        print("메타데이터 생성 완료")

        # ------------------------------------------------------------------
        # 2. 결과 반환
        # ------------------------------------------------------------------
        return {
            "title": info.get("title", "Unknown Title"),
            "thumbnail": thumbnail_path,
            "duration_sec": info.get("duration", 0),
            "audio_file": wav_path,
            "subtitles": subtitle_files,
            "vtt_official": vtt_official
        }
    except Exception as e:
        raise RuntimeError(f"YouTube download failed: {str(e)}")