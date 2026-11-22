"""
Configuration settings for NetGuard AI Backend.
Supports loading from environment variables with sensible production and local defaults.
"""

from pathlib import Path
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    PROJECT_NAME: str = "NetGuard AI"
    VERSION: str = "1.0.0"
    DEBUG: bool = False
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # CORS Origins (comma-separated or list)
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000,*"

    # File Paths
    DB_PATH: str = str(BASE_DIR / "backend" / "netguard.db")
    DATASET_PATH: str = str(BASE_DIR / "data" / "processed" / "cicids2017_sample.csv")
    MODEL_DIR: str = str(BASE_DIR / "backend" / "models" / "trained")
    EVAL_DIR: str = str(BASE_DIR / "backend" / "models" / "evaluation")

    # Replay Configuration
    DEFAULT_REPLAY_INTERVAL_SEC: float = 0.5  # 2 flows per sec default
    BENIGN_WARMUP_SECONDS: int = 60

    @property
    def cors_list(self) -> List[str]:
        if not self.CORS_ORIGINS:
            return ["*"]
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


settings = Settings()
