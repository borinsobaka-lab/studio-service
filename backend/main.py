from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import init_db
from routers import auth, recordings, transcription, analysis, prompts

app = FastAPI(title="Studio Stretch - Аналитика звонков")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(recordings.router)
app.include_router(transcription.router)
app.include_router(analysis.router)
app.include_router(prompts.router)


@app.on_event("startup")
def startup():
    init_db()


@app.get("/api/health")
def health():
    return {"status": "ok"}
