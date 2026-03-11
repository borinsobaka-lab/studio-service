import os
import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, File, Form, UploadFile, HTTPException
from database import get_db
from routers.deps import require_auth
from config import settings

router = APIRouter(prefix="/api/recordings", tags=["recordings"], dependencies=[Depends(require_auth)])


@router.post("")
def upload_recording(
    file: UploadFile = File(...),
    admin_name: str = Form(...),
    record_date: str = Form(...),
    record_time: str = Form(...),
    db=Depends(get_db),
):
    ext = os.path.splitext(file.filename)[1] if file.filename else ".wav"
    unique_name = f"{uuid.uuid4().hex}{ext}"
    filepath = os.path.join(settings.UPLOAD_DIR, unique_name)

    with open(filepath, "wb") as f:
        content = file.file.read()
        f.write(content)

    db.execute(
        "INSERT INTO recordings (filename, original_name, admin_name, record_date, record_time) VALUES (%s, %s, %s, %s, %s)",
        (unique_name, file.filename, admin_name, record_date, record_time),
    )
    db.commit()
    return {"status": "ok", "message": "Файл загружен"}


@router.get("")
def list_recordings(db=Depends(get_db)):
    rows = db.execute(
        "SELECT id, original_name, admin_name, record_date, record_time, created_at, "
        "transcription IS NOT NULL as has_transcription, "
        "analysis IS NOT NULL as has_analysis "
        "FROM recordings ORDER BY created_at DESC"
    ).fetchall()
    return [dict(r) for r in rows]


@router.get("/{recording_id}")
def get_recording(recording_id: int, db=Depends(get_db)):
    row = db.execute("SELECT * FROM recordings WHERE id = %s", (recording_id,)).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Запись не найдена")
    return dict(row)
