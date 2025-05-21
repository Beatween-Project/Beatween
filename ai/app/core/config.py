from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    # AWS 설정
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_REGION: str = "ap-northeast-2"
    AWS_S3_BUCKET: str = ""
    
    # 앱 설정
    DEBUG: bool = False

    # OPENAI API 키
    OPENAI_API_KEY: str = ""

    # GOOGLE 로그인 ID, PW
    GOOGLE_ID: str = ""
    GOOGLE_PW: str = ""
    
    class Config:
        env_file = ".env"

@lru_cache
def get_settings():
    return Settings()
