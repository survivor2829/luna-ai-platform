import json
from typing import Optional
from .models import User, Agent

# 会员等级配额
TIER_LIMITS = {
    "guest": {"custom": 0, "general": 0},
    "365": {"custom": 1, "general": 3},
    "3980": {"custom": -1, "general": -1}  # -1=无限
}


def can_access_agent(user: Optional[User], agent: Agent) -> bool:
    """判断用户是否有权限访问智能体"""
    # 未登录用户不能访问
    if user is None:
        return False

    # 游客不能访问
    if user.tier == "guest":
        return False

    # 3980全部可用
    if user.tier == "3980":
        return True

    # 365会员检查限制
    if agent.category == "custom":
        # 定制智能体必须在绑定列表中
        try:
            binded = json.loads(user.binded_agents or "[]")
        except json.JSONDecodeError:
            binded = []
        return agent.id in binded
    else:
        # 通用智能体：365会员可用所有tier_required="365"的通用智能体
        return agent.tier_required == "365"
