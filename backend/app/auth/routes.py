from fastapi import APIRouter, HTTPException, status, Depends
from app.models import LoginRequest, TokenResponse
from app.auth.jwt_handler import verify_credentials, create_access_token, verify_token
from datetime import timedelta

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest):
    """
    Login endpoint for founders
    
    Returns JWT token if credentials are valid
    """
    credentials = verify_credentials(request.username, request.password)
    
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )
    
    access_token = create_access_token(
        username=credentials["username"],
        founder_name=credentials["founder"],
        expires_delta=timedelta(hours=24)
    )
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        founder=credentials["founder"]
    )

@router.get("/verify")
async def verify_auth(user: dict = Depends(verify_token)):
    """
    Verify token and return current user info
    """
    return {
        "username": user["username"],
        "founder": user["founder"],
        "authenticated": True
    }
