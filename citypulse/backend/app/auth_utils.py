import hashlib
import hmac
import secrets
import os
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any

AUTH_SECRET = os.getenv("AUTH_SECRET", "citypulse-secret-jwt-key-2026-hackathon-secure")

def hash_password(password: str) -> str:
    """Securely hash a password using PBKDF2-HMAC-SHA256 with a random salt."""
    salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100_000
    )
    return f"{salt}${key.hex()}"

def verify_password(password: str, hashed: str) -> bool:
    """Verify a raw password against the stored salt$hash string."""
    try:
        parts = hashed.split('$')
        if len(parts) != 2:
            return False
        salt, key_hex = parts
        computed_key = hashlib.pbkdf2_hmac(
            'sha256',
            password.encode('utf-8'),
            salt.encode('utf-8'),
            100_000
        )
        return hmac.compare_digest(computed_key.hex(), key_hex)
    except Exception:
        return False

def generate_session_token() -> str:
    """Generate a cryptographically secure random session token."""
    return secrets.token_urlsafe(32)

def generate_reset_token() -> str:
    """Generate a random reset token."""
    return secrets.token_urlsafe(24)
