from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List


# ============ Auth Schemas ============

class UserRegister(BaseModel):
    phone: str
    password: str


class UserLogin(BaseModel):
    phone: str
    password: str


class UserResponse(BaseModel):
    id: int
    phone: str
    tier: str
    tier_expire_at: Optional[datetime] = None
    binded_agents: str = "[]"
    is_admin: bool = False
    created_at: datetime
    is_active: bool = True

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class RegisterResponse(BaseModel):
    user_id: int
    phone: str
    tier: str


# ============ Agent Schemas ============

class AgentBase(BaseModel):
    name: str
    icon: str = "🤖"
    description: Optional[str] = None
    category: str = "general"


class AgentCreate(AgentBase):
    api_endpoint: str
    api_token: str
    project_id: str
    tier_required: str = "365"
    status: str = "active"
    sort_order: int = 0


class AgentUpdate(BaseModel):
    name: Optional[str] = None
    icon: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    api_endpoint: Optional[str] = None
    api_token: Optional[str] = None
    project_id: Optional[str] = None
    tier_required: Optional[str] = None
    status: Optional[str] = None
    sort_order: Optional[int] = None


class AgentResponse(BaseModel):
    id: int
    name: str
    icon: str
    description: Optional[str]
    category: str
    tier_required: str
    status: str
    sort_order: int
    created_at: datetime
    can_access: bool = False

    class Config:
        from_attributes = True


class AgentAdminResponse(BaseModel):
    id: int
    name: str
    icon: str
    description: Optional[str]
    category: str
    api_endpoint: str
    api_token: str
    project_id: str
    tier_required: str
    status: str
    sort_order: int
    created_at: datetime

    class Config:
        from_attributes = True


# ============ Chat Schemas ============

class ChatRequest(BaseModel):
    message: str


class ChatMessageResponse(BaseModel):
    id: int
    role: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True


class ChatHistoryResponse(BaseModel):
    messages: List[ChatMessageResponse]


# ============ Admin User Schemas ============

class UserAdminUpdate(BaseModel):
    tier: Optional[str] = None
    tier_expire_at: Optional[datetime] = None
    binded_agents: Optional[str] = None
    is_active: Optional[bool] = None
