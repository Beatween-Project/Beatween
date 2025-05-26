# 1) 베이스 이미지 버전만 변경
FROM ubuntu:22.04

# 비대화형 모드 + Qt offscreen 설정
ENV DEBIAN_FRONTEND=noninteractive
ENV QT_QPA_PLATFORM=offscreen

# 2) 시스템 패키지 업데이트 및 설치
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      unzip \
      graphviz \
      curl \
      musescore3 \
      python3 \
      python3-pip \
      ffmpeg \
      libsndfile1 \
      build-essential \
      git \
      libgomp1 \
      libatomic1 && \
    rm -rf /var/lib/apt/lists/*

# 3) pip 업그레이드
RUN pip3 install --upgrade pip \
    && pip3 install --no-cache-dir --upgrade yt-dlp

# 작업 디렉터리 설정
WORKDIR /app

# Python 의존성 설치
COPY requirements.txt /app/
RUN pip3 install --no-cache-dir -r requirements.txt

# 소스 코드 복사
COPY . .

# 서버 실행
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
