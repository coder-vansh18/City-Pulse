import uuid
import re
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Depends, Header, Cookie, Response, status
from pydantic import BaseModel, Field

from app.db import db
from app.auth_utils import (
    hash_password,
    verify_password,
    generate_session_token,
    generate_reset_token,
)

auth_router = APIRouter(prefix="/api/auth", tags=["Authentication"])

EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")

def validate_email_format(email: str) -> str:
    cleaned = email.strip().lower()
    if not EMAIL_REGEX.match(cleaned):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide a valid email address."
        )
    return cleaned

# Models
class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: str = Field(..., min_length=5, max_length=120)
    password: str = Field(..., min_length=8)

class LoginRequest(BaseModel):
    email: str
    password: str

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8)

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str = "operator"
    created_at: Optional[str] = None

class AuthResponse(BaseModel):
    user: UserResponse
    token: str
    message: str = "Authentication successful"

# Helper to validate strong password
def validate_password_strength(password: str) -> None:
    if len(password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters long."
        )
    if not re.search(r"[A-Z]", password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must contain at least one uppercase letter."
        )
    if not re.search(r"[a-z]", password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must contain at least one lowercase letter."
        )
    if not re.search(r"[0-9]", password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must contain at least one number."
        )

# Dependency to extract and verify session
def get_current_user(
    authorization: Optional[str] = Header(None),
    citypulse_session: Optional[str] = Cookie(None)
) -> Dict[str, Any]:
    token = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1].strip()
    elif citypulse_session:
        token = citypulse_session.strip()

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided."
        )

    session = db.get_session(token)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Your session has expired. Please sign in again."
        )

    # Check expiry
    try:
        expires_at = datetime.fromisoformat(session["expires_at"])
        if datetime.now(timezone.utc) > expires_at:
            db.delete_session(token)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Your session has expired. Please sign in again."
            )
    except ValueError:
        pass

    return {
        "id": session["id"],
        "name": session["name"],
        "email": session["email"],
        "role": session.get("role", "operator"),
        "token": token
    }

@auth_router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, response: Response):
    email_clean = validate_email_format(payload.email)
    
    # Check if user already exists
    existing = db.get_user_by_email(email_clean)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    # Validate password rules
    validate_password_strength(payload.password)

    # Hash and create user
    user_id = f"usr-{uuid.uuid4().hex[:12]}"
    pw_hash = hash_password(payload.password)
    user = db.create_user(
        user_id=user_id,
        name=payload.name.strip(),
        email=email_clean,
        password_hash=pw_hash,
        role="operator"
    )

    # Create session token (valid for 7 days)
    token = generate_session_token()
    expires_at = (datetime.now(timezone.utc) + timedelta(days=7)).isoformat()
    db.create_session(token, user_id, expires_at)

    # Set secure HttpOnly cookie
    response.set_cookie(
        key="citypulse_session",
        value=token,
        httponly=True,
        max_age=7 * 24 * 3600,
        samesite="lax",
        secure=False # Set to True in production with HTTPS
    )

    return AuthResponse(
        user=UserResponse(
            id=user["id"],
            name=user["name"],
            email=user["email"],
            role=user["role"],
            created_at=user["created_at"]
        ),
        token=token,
        message="Account created successfully."
    )

@auth_router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest, response: Response):
    email_clean = payload.email.lower().strip()
    user = db.get_user_by_email(email_clean)
    
    # Check credentials
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    # Create session (7 days validity)
    token = generate_session_token()
    expires_at = (datetime.now(timezone.utc) + timedelta(days=7)).isoformat()
    db.create_session(token, user["id"], expires_at)

    # Set HttpOnly cookie
    response.set_cookie(
        key="citypulse_session",
        value=token,
        httponly=True,
        max_age=7 * 24 * 3600,
        samesite="lax",
        secure=False
    )

    return AuthResponse(
        user=UserResponse(
            id=user["id"],
            name=user["name"],
            email=user["email"],
            role=user.get("role", "operator"),
            created_at=user.get("created_at")
        ),
        token=token,
        message="Signed in successfully."
    )

@auth_router.post("/logout")
def logout(response: Response, current_user: Dict[str, Any] = Depends(get_current_user)):
    token = current_user.get("token")
    if token:
        db.delete_session(token)
    
    # Delete cookie
    response.delete_cookie(key="citypulse_session")
    return {"ok": True, "message": "Logged out successfully."}

@auth_router.get("/me", response_model=UserResponse)
def get_me(current_user: Dict[str, Any] = Depends(get_current_user)):
    return UserResponse(
        id=current_user["id"],
        name=current_user["name"],
        email=current_user["email"],
        role=current_user.get("role", "operator")
    )

@auth_router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordRequest):
    email_clean = payload.email.lower().strip()
    user = db.get_user_by_email(email_clean)
    
    # Generate reset token if user exists
    if user:
        token = generate_reset_token()
        expires_at = (datetime.now(timezone.utc) + timedelta(hours=2)).isoformat()
        db.create_password_reset(token, email_clean, expires_at)

    # Always return a clean, friendly message (never leak whether email exists)
    return {
        "ok": True,
        "message": "If an account matches this email, password reset instructions have been dispatched.",
        "demo_token": token if user else None # Helper for local demo testing
    }

@auth_router.post("/reset-password")
def reset_password(payload: ResetPasswordRequest):
    reset_record = db.get_password_reset(payload.token)
    if not reset_record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The password reset link is invalid or has expired."
        )

    # Check expiry
    try:
        expires_at = datetime.fromisoformat(reset_record["expires_at"])
        if datetime.now(timezone.utc) > expires_at:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The password reset link has expired."
            )
    except ValueError:
        pass

    validate_password_strength(payload.new_password)

    user = db.get_user_by_email(reset_record["email"])
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )

    new_hash = hash_password(payload.new_password)
    db.update_user_password(user["id"], new_hash)
    db.mark_password_reset_used(payload.token)

    return {
        "ok": True,
        "message": "Password reset successfully. Please sign in with your new password."
    }
