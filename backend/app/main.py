import os
from pathlib import Path
from dotenv import load_dotenv

# 加载 .env 文件（在其他导入之前）
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(env_path)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import init_db, SessionLocal
from .models import User
from .utils import hash_password
from .routers import auth, agents, admin, stats, feedback

app = FastAPI(
    title="Luna AI Platform",
    description="Luna AI Platform API",
    version="1.0.0"
)

# CORS configuration for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(auth.router)
app.include_router(agents.router)
app.include_router(admin.router)
app.include_router(stats.router)
app.include_router(feedback.router)


def create_default_admin():
    """Create default admin user if not exists."""
    db = SessionLocal()
    try:
        admin_user = db.query(User).filter(User.phone == "admin").first()
        if not admin_user:
            # 从环境变量读取管理员密码
            admin_password = os.getenv("ADMIN_DEFAULT_PASSWORD")
            if not admin_password:
                print("Warning: ADMIN_DEFAULT_PASSWORD not set, skipping default admin creation.")
                print("Set ADMIN_DEFAULT_PASSWORD environment variable to create default admin.")
                return

            admin_user = User(
                phone="admin",
                password_hash=hash_password(admin_password),
                is_admin=True,
                tier="3980",
                is_active=True
            )
            db.add(admin_user)
            db.commit()
            print("Default admin created with username: admin")
            print("Password is set from ADMIN_DEFAULT_PASSWORD environment variable")
    finally:
        db.close()


@app.on_event("startup")
def startup():
    init_db()
    create_default_admin()


@app.get("/")
def read_root():
    return {"message": "Welcome to Luna AI Platform"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}
