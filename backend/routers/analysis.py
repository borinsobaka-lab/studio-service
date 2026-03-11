from fastapi import APIRouter, Depends, HTTPException
from openai import OpenAI
from database import get_db
from routers.deps import require_auth
from config import settings

router = APIRouter(prefix="/api/analysis", tags=["analysis"], dependencies=[Depends(require_auth)])


@router.post("/{recording_id}")
def analyze(recording_id: int, db=Depends(get_db)):
    row = db.execute("SELECT * FROM recordings WHERE id = %s", (recording_id,)).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Запись не найдена")
    if not row["transcription"]:
        raise HTTPException(status_code=400, detail="Сначала выполните транскрибацию")
    if row["analysis"]:
        return {"analysis": row["analysis"]}

    # Get active prompt
    prompt_row = db.execute("SELECT content FROM prompts WHERE is_active = TRUE ORDER BY id DESC LIMIT 1").fetchone()
    if not prompt_row:
        raise HTTPException(status_code=400, detail="Нет активного промпта для анализа")

    system_prompt = prompt_row["content"]
    full_prompt = system_prompt + "\n\n" + row["transcription"]

    client = OpenAI(api_key=settings.OPENAI_API_KEY)
    response = client.chat.completions.create(
        model="gpt-5",
        messages=[
            {"role": "system", "content": "Ты — эксперт по оценке качества продаж в студии растяжки. Анализируй диалоги и давай подробную обратную связь."},
            {"role": "user", "content": full_prompt},
        ],
        temperature=0.3,
    )

    analysis_text = response.choices[0].message.content
    db.execute("UPDATE recordings SET analysis = %s WHERE id = %s", (analysis_text, recording_id))
    db.commit()

    return {"analysis": analysis_text}
