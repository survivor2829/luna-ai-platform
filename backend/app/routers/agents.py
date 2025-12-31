import json
import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from ..database import get_db, SessionLocal
from ..models import User, Agent, ChatMessage
from ..schemas import AgentResponse, ChatRequest, ChatMessageResponse, ChatHistoryResponse
from ..auth import get_current_user, get_current_user_optional
from ..permissions import can_access_agent
from ..services.coze import call_coze_agent

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/agents", tags=["智能体"])


@router.get("", response_model=List[AgentResponse])
def list_agents(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """获取智能体列表"""
    agents = db.query(Agent).order_by(Agent.sort_order, Agent.id).all()

    result = []
    for agent in agents:
        agent_dict = {
            "id": agent.id,
            "name": agent.name,
            "icon": agent.icon,
            "description": agent.description,
            "category": agent.category,
            "tier_required": agent.tier_required,
            "status": agent.status,
            "sort_order": agent.sort_order,
            "created_at": agent.created_at,
            "can_access": can_access_agent(current_user, agent)
        }
        result.append(AgentResponse(**agent_dict))

    return result


@router.get("/{agent_id}", response_model=AgentResponse)
def get_agent(
    agent_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """获取单个智能体详情"""
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="智能体不存在"
        )

    return AgentResponse(
        id=agent.id,
        name=agent.name,
        icon=agent.icon,
        description=agent.description,
        category=agent.category,
        tier_required=agent.tier_required,
        status=agent.status,
        sort_order=agent.sort_order,
        created_at=agent.created_at,
        can_access=can_access_agent(current_user, agent)
    )


@router.get("/{agent_id}/history", response_model=ChatHistoryResponse)
def get_chat_history(
    agent_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取与智能体的对话历史"""
    # 检查智能体是否存在
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="智能体不存在"
        )

    # 获取历史消息
    messages = db.query(ChatMessage).filter(
        ChatMessage.user_id == current_user.id,
        ChatMessage.agent_id == agent_id
    ).order_by(ChatMessage.created_at).all()

    return ChatHistoryResponse(messages=messages)


@router.delete("/{agent_id}/history")
def clear_chat_history(
    agent_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """清空与智能体的对话历史"""
    db.query(ChatMessage).filter(
        ChatMessage.user_id == current_user.id,
        ChatMessage.agent_id == agent_id
    ).delete()
    db.commit()
    return {"message": "对话记录已清空"}


@router.post("/{agent_id}/chat")
async def chat_with_agent(
    agent_id: int,
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """与智能体对话（SSE流式响应）"""
    # 1. 获取智能体
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="智能体不存在"
        )

    # 2. 权限检查
    if not can_access_agent(current_user, agent):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="无权访问此智能体，请升级会员"
        )

    # 3. 检查智能体状态
    if agent.status != "active":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="该智能体暂未开放"
        )

    # 4. 提取需要的字段到局部变量（避免Session关闭后无法访问）
    api_endpoint = agent.api_endpoint
    api_token = agent.api_token
    project_id = agent.project_id
    user_id = current_user.id
    message = request.message

    # 5. 保存用户消息
    user_message = ChatMessage(
        user_id=user_id,
        agent_id=agent_id,
        role="user",
        content=message
    )
    db.add(user_message)
    db.commit()

    # 6. 调用Coze API，返回SSE流，并保存AI回复
    full_response = []

    async def generate():
        try:
            async for chunk in call_coze_agent(
                api_endpoint,
                api_token,
                project_id,
                message
            ):
                full_response.append(chunk)
                # SSE格式返回给前端
                yield f"data: {json.dumps({'content': chunk}, ensure_ascii=False)}\n\n"

            # 保存AI回复（使用新的Session）
            if full_response:
                new_db = SessionLocal()
                try:
                    ai_message = ChatMessage(
                        user_id=user_id,
                        agent_id=agent_id,
                        role="assistant",
                        content="".join(full_response)
                    )
                    new_db.add(ai_message)
                    new_db.commit()
                    logger.info(f"Saved AI response: {len(''.join(full_response))} chars")
                finally:
                    new_db.close()

            yield "data: [DONE]\n\n"
        except HTTPException as e:
            # 将错误信息也通过SSE返回
            yield f"data: {json.dumps({'error': e.detail}, ensure_ascii=False)}\n\n"
            yield "data: [DONE]\n\n"
        except Exception as e:
            logger.error(f"Chat error: {e}")
            yield f"data: {json.dumps({'error': str(e)}, ensure_ascii=False)}\n\n"
            yield "data: [DONE]\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive"
        }
    )
