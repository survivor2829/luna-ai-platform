from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    phone = Column(String(20), unique=True, index=True)  # 手机号登录
    password_hash = Column(String(128))  # 密码哈希

    # 会员
    tier = Column(String(20), default="guest")  # guest / 365 / 3980
    tier_expire_at = Column(DateTime, nullable=True)  # 过期时间，null=永久
    binded_agents = Column(Text, default="[]")  # 绑定的定制智能体ID，JSON数组

    # 管理员标识
    is_admin = Column(Boolean, default=False)

    # 时间
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)


class Agent(Base):
    __tablename__ = "agents"

    id = Column(Integer, primary_key=True)

    # 展示信息
    name = Column(String(100), nullable=False)
    icon = Column(String(50), default="🤖")
    description = Column(Text)
    category = Column(String(20), default="general")  # custom / general

    # Coze API（后台配置）
    api_endpoint = Column(String(500), nullable=False)
    api_token = Column(Text, nullable=False)
    project_id = Column(String(50), nullable=False)

    # 权限与状态
    tier_required = Column(String(20), default="365")  # 最低会员等级
    status = Column(String(20), default="active")  # active / coming_soon
    sort_order = Column(Integer, default=0)

    created_at = Column(DateTime, default=datetime.utcnow)


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    agent_id = Column(Integer, ForeignKey("agents.id"), nullable=False, index=True)
    role = Column(String(20), nullable=False)  # user / assistant
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # 关联
    user = relationship("User", backref="messages")
    agent = relationship("Agent", backref="messages")
