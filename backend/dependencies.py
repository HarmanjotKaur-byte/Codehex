from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from database import get_db
from models import User, UserRole, VerificationStatus
from security import decode_access_token

security_scheme = HTTPBearer(auto_error=True)

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
    db: Session = Depends(get_db)
) -> User:
    """Authenticates JWT token and retrieves current database user."""
    token = credentials.credentials
    try:
        payload = decode_access_token(token)
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload: missing subject."
            )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"}
        )

    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User associated with token does not exist."
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive or disabled."
        )
    return user

def require_farmer(current_user: User = Depends(get_current_user)) -> User:
    """Restricts access exclusively to FARMER role."""
    if current_user.role != UserRole.FARMER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted to registered Farmer accounts only."
        )
    return current_user

def require_buyer(current_user: User = Depends(get_current_user)) -> User:
    """Restricts access exclusively to BUYER role."""
    if current_user.role != UserRole.BUYER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted to registered Biomass Buyer accounts only."
        )
    return current_user

def require_government(current_user: User = Depends(get_current_user)) -> User:
    """Restricts access to GOVERNMENT role (any verification state)."""
    if current_user.role != UserRole.GOVERNMENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted to Government Officer accounts only."
        )
    return current_user

def require_verified_government(current_user: User = Depends(get_current_user)) -> User:
    """Restricts access to GOVERNMENT accounts (directly active without Super Admin verification)."""
    if current_user.role != UserRole.GOVERNMENT and current_user.role != UserRole.SUPER_ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted to Government Officer accounts only."
        )
    return current_user

def require_super_admin(current_user: User = Depends(get_current_user)) -> User:
    """Fallback: allows Government Officers and Super Admins."""
    if current_user.role != UserRole.SUPER_ADMIN and current_user.role != UserRole.GOVERNMENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted to authorized administrative officers."
        )
    return current_user
