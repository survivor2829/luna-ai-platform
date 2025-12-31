from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, Agent
from ..schemas import (
    AgentCreate, AgentUpdate, AgentAdminResponse,
    UserResponse, UserAdminUpdate
)
from ..auth import require_admin

router = APIRouter(prefix="/api/admin", tags=["管理后台"])


# ============ 智能体管理 ============

@router.get("/agents", response_model=List[AgentAdminResponse])
def list_agents_admin(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """获取智能体列表（含完整配置）"""
    agents = db.query(Agent).order_by(Agent.sort_order, Agent.id).all()
    return [AgentAdminResponse.model_validate(a) for a in agents]


@router.post("/agents", response_model=AgentAdminResponse)
def create_agent(
    data: AgentCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """添加智能体"""
    agent = Agent(
        name=data.name,
        icon=data.icon,
        description=data.description,
        category=data.category,
        api_endpoint=data.api_endpoint,
        api_token=data.api_token,
        project_id=data.project_id,
        tier_required=data.tier_required,
        status=data.status,
        sort_order=data.sort_order
    )
    db.add(agent)
    db.commit()
    db.refresh(agent)
    return AgentAdminResponse.model_validate(agent)


@router.put("/agents/{agent_id}", response_model=AgentAdminResponse)
def update_agent(
    agent_id: int,
    data: AgentUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """修改智能体"""
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="智能体不存在"
        )

    # 更新非空字段
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if value is not None:
            setattr(agent, key, value)

    db.commit()
    db.refresh(agent)
    return AgentAdminResponse.model_validate(agent)


@router.delete("/agents/{agent_id}")
def delete_agent(
    agent_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """删除智能体"""
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="智能体不存在"
        )

    db.delete(agent)
    db.commit()
    return {"message": "删除成功"}


# ============ 用户管理 ============

@router.get("/users", response_model=List[UserResponse])
def list_users(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """获取用户列表"""
    users = db.query(User).order_by(User.id).all()
    return [UserResponse.model_validate(u) for u in users]


@router.put("/users/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    data: UserAdminUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """修改用户（tier, tier_expire_at, binded_agents, is_active）"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )

    # 更新非空字段
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if value is not None:
            setattr(user, key, value)

    db.commit()
    db.refresh(user)
    return UserResponse.model_validate(user)
