from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from database import get_db
from routers.deps import require_auth

router = APIRouter(prefix="/api/prompts", tags=["prompts"], dependencies=[Depends(require_auth)])


class PromptCreate(BaseModel):
    title: str
    content: str


@router.get("")
def list_prompts(db=Depends(get_db)):
    rows = db.execute("SELECT * FROM prompts ORDER BY created_at DESC").fetchall()
    return [dict(r) for r in rows]


@router.post("")
def create_prompt(req: PromptCreate, db=Depends(get_db)):
    # Deactivate all existing prompts
    db.execute("UPDATE prompts SET is_active = FALSE")
    db.execute(
        "INSERT INTO prompts (title, content, is_active) VALUES (%s, %s, TRUE)",
        (req.title, req.content),
    )
    db.commit()
    return {"status": "ok", "message": "Промпт сохранён и активирован"}


@router.put("/{prompt_id}/activate")
def activate_prompt(prompt_id: int, db=Depends(get_db)):
    row = db.execute("SELECT id FROM prompts WHERE id = %s", (prompt_id,)).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Промпт не найден")
    db.execute("UPDATE prompts SET is_active = FALSE")
    db.execute("UPDATE prompts SET is_active = TRUE WHERE id = %s", (prompt_id,))
    db.commit()
    return {"status": "ok"}


@router.delete("/{prompt_id}")
def delete_prompt(prompt_id: int, db=Depends(get_db)):
    db.execute("DELETE FROM prompts WHERE id = %s", (prompt_id,))
    db.commit()
    return {"status": "ok"}
