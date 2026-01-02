from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import datetime
from pydantic import BaseModel
from typing import Optional, List
from ..database import get_db
from ..auth import get_current_user, require_admin

router = APIRouter(prefix="/api", tags=["feedback"])


# Schemas
class FeedbackCreate(BaseModel):
    type: str = "suggestion"  # suggestion/bug/question
    content: str
    contact: Optional[str] = None
    page_url: Optional[str] = None


class FeedbackResponse(BaseModel):
    id: int
    user_id: Optional[int]
    user_phone: Optional[str] = None
    type: str
    content: str
    contact: Optional[str]
    page_url: Optional[str]
    status: str
    created_at: datetime


class FeedbackStatusUpdate(BaseModel):
    status: str  # pending/read/resolved


# User endpoint - submit feedback
@router.post("/feedback")
async def submit_feedback(
    data: FeedbackCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """提交用户反馈"""
    if not data.content or not data.content.strip():
        raise HTTPException(status_code=400, detail="反馈内容不能为空")

    db.execute(
        text("""
            INSERT INTO feedbacks (user_id, type, content, contact, page_url, status, created_at)
            VALUES (:user_id, :type, :content, :contact, :page_url, 'pending', :created_at)
        """),
        {
            "user_id": current_user.id,
            "type": data.type,
            "content": data.content.strip(),
            "contact": data.contact,
            "page_url": data.page_url,
            "created_at": datetime.now()
        }
    )
    db.commit()

    return {"message": "感谢您的反馈！"}


# Admin endpoints
@router.get("/admin/feedbacks", response_model=List[FeedbackResponse])
async def list_feedbacks(
    status: Optional[str] = None,
    current_admin=Depends(require_admin),
    db: Session = Depends(get_db)
):
    """管理员查看所有反馈"""
    if status:
        result = db.execute(
            text("""
                SELECT f.id, f.user_id, u.phone as user_phone, f.type, f.content,
                       f.contact, f.page_url, f.status, f.created_at
                FROM feedbacks f
                LEFT JOIN users u ON f.user_id = u.id
                WHERE f.status = :status
                ORDER BY f.created_at DESC
            """),
            {"status": status}
        ).fetchall()
    else:
        result = db.execute(
            text("""
                SELECT f.id, f.user_id, u.phone as user_phone, f.type, f.content,
                       f.contact, f.page_url, f.status, f.created_at
                FROM feedbacks f
                LEFT JOIN users u ON f.user_id = u.id
                ORDER BY f.created_at DESC
            """)
        ).fetchall()

    return [
        FeedbackResponse(
            id=row[0],
            user_id=row[1],
            user_phone=row[2],
            type=row[3],
            content=row[4],
            contact=row[5],
            page_url=row[6],
            status=row[7],
            created_at=row[8]
        )
        for row in result
    ]


@router.put("/admin/feedbacks/{feedback_id}")
async def update_feedback_status(
    feedback_id: int,
    data: FeedbackStatusUpdate,
    current_admin=Depends(require_admin),
    db: Session = Depends(get_db)
):
    """更新反馈状态"""
    if data.status not in ["pending", "read", "resolved"]:
        raise HTTPException(status_code=400, detail="无效的状态")

    result = db.execute(
        text("SELECT id FROM feedbacks WHERE id = :id"),
        {"id": feedback_id}
    ).fetchone()

    if not result:
        raise HTTPException(status_code=404, detail="反馈不存在")

    db.execute(
        text("UPDATE feedbacks SET status = :status WHERE id = :id"),
        {"status": data.status, "id": feedback_id}
    )
    db.commit()

    return {"message": "状态已更新"}
