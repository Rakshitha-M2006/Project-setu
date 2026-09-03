import os
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "PROJECT SETU - AI Microservice"
    ENVIRONMENT: str = "development"
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:5000",
        "http://localhost:5173",
        "http://127.0.0.1:5000",
        "http://127.0.0.1:5173",
        "*"
    ]
    # Configurable confidence threshold for human review
    CONFIDENCE_THRESHOLD: float = float(os.getenv("AI_CONFIDENCE_THRESHOLD", "0.85"))
    MODEL_VERSION: str = "1.0.0-nlp-rules"
    INTERNAL_API_SECRET: str = os.getenv("SETU_INTERNAL_API_KEY", "setu_internal_microservice_secret_key_2026")

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
