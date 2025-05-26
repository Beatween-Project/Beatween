import boto3
from botocore.exceptions import ClientError
import os
from core.config import get_settings

def upload_file(local_path, s3_key=None):
    """
    로컬 파일 하나를 S3에 업로드합니다.
    :param local_path: 업로드할 파일의 로컬 경로 (예: storage/demucs/htdemucs/input/bass.wav)
    :param s3_key: S3에 저장될 키 (경로). None이면 local_path에서 상대경로 추출
    """
    settings = get_settings()
    s3 = boto3.client(
        "s3",
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=settings.AWS_REGION
    )
    # S3 key가 없으면 storage/ 이하 경로를 그대로 사용
    if s3_key is None:
        s3_key = os.path.relpath(local_path, "input").replace("\\", "/")
    try:
        s3.upload_file(local_path, settings.AWS_S3_BUCKET, s3_key)
        print(f"업로드 성공: {local_path} → s3://{settings.AWS_S3_BUCKET}/{s3_key}")
        return f"https://{settings.AWS_S3_BUCKET}.s3.{settings.AWS_REGION}.amazonaws.com/{s3_key}"
    except ClientError as e:
        print(f"업로드 실패: {local_path} ({e})")
        return False

