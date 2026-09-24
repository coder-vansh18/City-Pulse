from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Literal, Optional
import os

class Settings(BaseSettings):
    CITY_NAME: str = "Demo City"
    CITY_LAT: float = 40.7128
    CITY_LON: float = -74.0060
    USE_REAL_WEATHER: bool = True
    LLM_PROVIDER: Literal["none", "gemini", "anthropic", "openai"] = "none"
    LLM_API_KEY: Optional[str] = None
    ENABLE_ML: bool = False
    SIM_SPEED: float = 1.0
    SEED: Optional[int] = 42
    DB_PATH: str = "./citypulse.db"
    PORT: int = 8000
    HOST: str = "0.0.0.0"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
