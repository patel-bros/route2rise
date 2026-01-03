import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    # MongoDB
    MONGODB_URL: str = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "route2rise")
    
    # JWT
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "your-secret-key")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    JWT_EXPIRATION_HOURS: int = int(os.getenv("JWT_EXPIRATION_HOURS", "24"))
    
    # Founders (Static Credentials)
    FOUNDER_A_USERNAME: str = os.getenv("FOUNDER_A_USERNAME", "founder_a")
    FOUNDER_A_PASSWORD: str = os.getenv("FOUNDER_A_PASSWORD", "password_a")
    FOUNDER_B_USERNAME: str = os.getenv("FOUNDER_B_USERNAME", "founder_b")
    FOUNDER_B_PASSWORD: str = os.getenv("FOUNDER_B_PASSWORD", "password_b")
    
    # App
    APP_NAME: str = os.getenv("APP_NAME", "Route2Rise")
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
    CORS_ORIGINS: list = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")

settings = Settings()
