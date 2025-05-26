# FastAPI

### 폴더 구조
```
ai/
│
├── app/                                # 애플리케이션 메인 패키지
│   ├── __init__.py
│   ├── main.py                         # FastAPI 인스턴스 및 시작점
│   │
│   ├── core/                           # 핵심 설정
│   │   ├── __init__.py
│   │   └── config.py                   # 환경 변수 및 API 키 설정
│   │
│   ├── services/                       # 핵심 비즈니스 로직
│   │   ├── __init__.py
│   │   ├── ex1.py                      # example1 로직
│   │   └── ex2.py                      # example2 로직
│   │
│   ├── schemas/                        # 데이터 모델 스키마
│   │   ├── __init__.py
│   │   ├── request.py                  # 요청 모델
│   │   └── response.py                 # 응답 모델
│   │
│   └── utils/                          # 유틸리티 함수
│       ├── __init__.py
│       └── helpers.py                  # 공통 헬퍼 함수
│
├── tests/                              # 테스트
│   ├── __init__.py
│   └── test_ex1.py
│
├── storage/                            # 임시 파일 저장소
│   ├── audio/                          # 추출된 오디오 파일
│   └── sheet_music/                    # 생성된 악보 파일
│
├── .env                                # 환경 변수 (API 키 등)
├── .gitignore
├── requirements.txt                    # 의존성 패키지
└── README.md
```