from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Shared credentials for all employees
    AUTH_LOGIN: str = "admin"
    AUTH_PASSWORD: str = "studio2024"
    JWT_SECRET: str = "change-me-in-production-use-long-random-string"

    # OpenAI API key for Whisper + GPT-5
    OPENAI_API_KEY: str = ""

    # Database (PostgreSQL)
    DATABASE_URL: str = "postgresql://studio:studio@localhost:5432/studio"

    # File uploads
    UPLOAD_DIR: str = "uploads"

    class Config:
        env_file = ".env"


settings = Settings()
