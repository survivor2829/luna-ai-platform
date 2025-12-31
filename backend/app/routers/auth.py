from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User
from ..schemas import UserRegister, UserLogin, UserResponse, TokenResponse, RegisterResponse
from ..utils import hash_password, verify_password
from ..auth import create_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["认证"])


@router.post("/register", response_model=RegisterResponse)
def register(data: UserRegister, db: Session = Depends(get_db)):
    """用户注册"""
    # 检查手机号是否已存在
    existing = db.query(User).filter(User.phone == data.phone).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="该手机号已注册"
        )

    # 创建用户
    user = User(
        phone=data.phone,
        password_hash=hash_password(data.password),
        tier="guest"
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return RegisterResponse(
        user_id=user.id,
        phone=user.phone,
        tier=user.tier
    )


@router.post("/login", response_model=TokenResponse)
def login(data: UserLogin, db: Session = Depends(get_db)):
    """用户登录"""
    user = db.query(User).filter(User.phone == data.phone).first()

    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="手机号或密码错误"
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="账户已被禁用"
        )

    token = create_token(user.id)

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """获取当前用户信息"""
    return UserResponse.model_validate(current_user)
