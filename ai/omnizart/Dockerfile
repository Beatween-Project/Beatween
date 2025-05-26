FROM python:3.8-slim

# 기본 디렉토리 설정
WORKDIR /app

# 시스템 의존성 설치
RUN apt-get update && apt-get install -y \
    build-essential \
    ffmpeg \
    libsndfile1 \
    && rm -rf /var/lib/apt/lists/*

# 필수 패키지 순차 설치 (버전 고정)
RUN pip install --no-cache-dir numpy==1.19.5 \
 && pip install --no-cache-dir cython==0.29.36 \
 && pip install --no-cache-dir setuptools wheel \
 && pip install --no-build-isolation --no-cache-dir madmom==0.16.1 \
 && pip install --no-cache-dir omnizart \
 && pip install --no-cache-dir werkzeug==2.0.3 \
 && pip install --no-cache-dir flask==2.0.3 \
 && pip install gunicorn==20.1.0
 # Flask 2.0.3 (Python 3.8 호환)

# 애플리케이션 코드 복사
COPY . .

# 모델 체크포인트 다운로드
RUN omnizart download-checkpoints

# Gunicorn으로 서버 실행
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "1", "--timeout", "600", "--log-level", "debug", "omnizart_service:app"]