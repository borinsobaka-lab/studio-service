import os
from fastapi import APIRouter, Depends, HTTPException
from openai import OpenAI
from database import get_db
from routers.deps import require_auth
from config import settings

router = APIRouter(prefix="/api/transcription", tags=["transcription"], dependencies=[Depends(require_auth)])


@router.post("/{recording_id}")
def transcribe(recording_id: int, db=Depends(get_db)):
    row = db.execute("SELECT * FROM recordings WHERE id = %s", (recording_id,)).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Запись не найдена")

    if row["transcription"]:
        return {"transcription": row["transcription"]}

    filepath = os.path.join(settings.UPLOAD_DIR, row["filename"])
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Аудиофайл не найден на диске")

    client = OpenAI(api_key=settings.OPENAI_API_KEY)

    with open(filepath, "rb") as audio_file:
        result = client.audio.transcriptions.create(
            model="whisper-1",
            file=audio_file,
            language="ru",
            response_format="verbose_json",
            timestamp_granularities=["segment"],
        )

    # Format transcription as dialogue
    segments = result.segments if hasattr(result, "segments") and result.segments else []
    if segments:
        lines = []
        current_speaker = None
        for i, seg in enumerate(segments):
            # Simple speaker diarization heuristic based on pauses
            # For production, use a dedicated diarization API
            if i == 0:
                speaker = "Администратор студии"
                current_speaker = speaker
            else:
                prev_end = segments[i - 1].get("end", 0) if isinstance(segments[i - 1], dict) else getattr(segments[i - 1], "end", 0)
                cur_start = seg.get("start", 0) if isinstance(seg, dict) else getattr(seg, "start", 0)
                pause = cur_start - prev_end
                if pause > 1.5:
                    current_speaker = (
                        "Клиент" if current_speaker == "Администратор студии" else "Администратор студии"
                    )
                speaker = current_speaker

            text = seg.get("text", "") if isinstance(seg, dict) else getattr(seg, "text", "")
            lines.append(f"{speaker}: {text.strip()}")
        transcription_text = "\n".join(lines)
    else:
        transcription_text = f"Администратор студии / Клиент:\n{result.text}"

    db.execute("UPDATE recordings SET transcription = %s WHERE id = %s", (transcription_text, recording_id))
    db.commit()

    return {"transcription": transcription_text}
