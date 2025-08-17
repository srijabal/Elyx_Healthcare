from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    # Supabase Database Configuration
    DATABASE_URL: str = "postgresql://postgres:your_password@db.your_project_ref.supabase.co:5432/postgres"
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    
    # Groq LLM Configuration
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama-3.3-70b-versatile"  # or "llama-3.1-8b-instant" for faster responses
    
    # Application Configuration
    SECRET_KEY: str = "your-secret-key-change-in-production"
    DEBUG: bool = True
    ENVIRONMENT: str = "development"
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"
    
    @property
    def allowed_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]

    class Config:
        env_file = ".env"


settings = Settings()