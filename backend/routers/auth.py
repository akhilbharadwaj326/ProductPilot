from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
import os
import jwt
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

class TokenResponse(BaseModel):
    access_token: str
    token_type: str

class GoogleAuthRequest(BaseModel):
    credential: str

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "super_secret_fallback_key")
ALGORITHM = "HS256"

@router.post("/google", response_model=TokenResponse)
def google_auth(payload: GoogleAuthRequest):
    # In a production app, verify the Google JWT here
    # For now, we simulate success and issue our own JWT
    user_email = "verified_user@example.com"
    
    access_token_expires = timedelta(minutes=60)
    expire = datetime.utcnow() + access_token_expires
    to_encode = {"sub": user_email, "exp": expire}
    
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    
    return {"access_token": encoded_jwt, "token_type": "bearer"}
