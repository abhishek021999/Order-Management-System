"""
Configuration management for the FastAPI application.
Handles environment variables and application settings.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Application
    app_name: str = "Inventory Management System"
    app_version: str = "1.0.0"
    debug: bool = False
    
    # Database
    database_url: str = "postgresql://user:password@localhost/inventory_db"
    
    # Server
    server_host: str = "0.0.0.0"
    server_port: int = 8000
    
    # Redis
    redis_url: str = "redis://localhost:6379/0"

    # CORS
    cors_origins: list = ["*"]

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=False)


settings = Settings()
