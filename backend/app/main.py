from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import init_db, SessionLocal
from .models import User
from .utils import hash_password
from .routers import auth, agents, admin

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


def create_default_admin():
    """Create default admin user if not exists."""
    db = SessionLocal()
    try:
        admin_user = db.query(User).filter(User.phone == "admin").first()
        if not admin_user:
            admin_user = User(
                phone="admin",
                password_hash=hash_password("luna2025"),
                is_admin=True,
                tier="3980",
                is_active=True
            )
            db.add(admin_user)
            db.commit()
            print("Default admin created: admin / luna2025")
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
