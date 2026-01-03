from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthCredentials
from app.config import settings
from app.models import FounderEnum
import logging

logger = logging.getLogger(__name__)

security = HTTPBearer()

def create_access_token(username: str, founder_name: str, expires_delta: Optional[timedelta] = None):
    """Create JWT access token"""
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(hours=settings.JWT_EXPIRATION_HOURS)
    
    to_encode = {
        "sub": username,
        "founder": founder_name,
        "exp": expire
    }
    
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt

async def verify_token(credentials: HTTPAuthCredentials = Depends(security)):
    """Verify JWT token and return user info"""
    token = credentials.credentials
    
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        username: str = payload.get("sub")
        founder: str = payload.get("founder")
        
        if username is None or founder is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
        
        return {"username": username, "founder": founder}
    
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )

def verify_credentials(username: str, password: str) -> Optional[dict]:
    """Verify founder credentials"""
    if (username == settings.FOUNDER_A_USERNAME and 
        password == settings.FOUNDER_A_PASSWORD):
        return {
            "username": username,
            "founder": FounderEnum.FOUNDER_A.value,
            "founder_enum": FounderEnum.FOUNDER_A
        }
    
    if (username == settings.FOUNDER_B_USERNAME and 
        password == settings.FOUNDER_B_PASSWORD):
        return {
            "username": username,
            "founder": FounderEnum.FOUNDER_B.value,
            "founder_enum": FounderEnum.FOUNDER_B
        }
    
    return None
