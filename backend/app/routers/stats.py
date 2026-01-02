from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import datetime
from ..database import get_db
from ..auth import get_current_user

router = APIRouter(prefix="/api/stats", tags=["stats"])

@router.get("/user")
async def get_user_stats(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取用户价值统计数据"""

    # 统计总对话次数（用户发送的消息数）
    total_result = db.execute(
        text("SELECT COUNT(*) FROM chat_messages WHERE user_id = :user_id AND role = 'user'"),
        {"user_id": current_user.id}
    ).fetchone()
    total_conversations = total_result[0] if total_result else 0

    # 计算使用天数
    days_since_register = (datetime.now() - current_user.created_at).days + 1

    # 最常用的智能体
    most_used = db.execute(
        text("""
            SELECT a.name, a.icon, COUNT(*) as count
            FROM chat_messages cm
            JOIN agents a ON cm.agent_id = a.id
            WHERE cm.user_id = :user_id AND cm.role = 'user'
            GROUP BY cm.agent_id
            ORDER BY count DESC
            LIMIT 1
        """),
        {"user_id": current_user.id}
    ).fetchone()

    # 推荐未使用或少用的智能体
    recommended = db.execute(
        text("""
            SELECT id, name, icon, description FROM agents
            WHERE status = 'active'
            AND id NOT IN (
                SELECT DISTINCT agent_id FROM chat_messages WHERE user_id = :user_id
            )
            LIMIT 1
        """),
        {"user_id": current_user.id}
    ).fetchone()

    # 计算价值
    cost_per_conversation = 15  # 每次对话节省15元人工成本
    time_per_conversation = 5   # 每次对话节省5分钟

    return {
        "total_conversations": total_conversations,
        "saved_cost": total_conversations * cost_per_conversation,
        "saved_time_minutes": total_conversations * time_per_conversation,
        "days_active": days_since_register,
        "most_used_agent": {
            "name": most_used[0] if most_used else None,
            "icon": most_used[1] if most_used else None,
            "count": most_used[2] if most_used else 0
        } if most_used else None,
        "recommended_agent": {
            "id": recommended[0],
            "name": recommended[1],
            "icon": recommended[2],
            "description": recommended[3]
        } if recommended else None
    }
