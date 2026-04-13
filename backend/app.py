from fastapi import FastAPI
from pydantic import BaseModel
from rag import get_transcript, build_db, ask_rag

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow frontend (extension) to call API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Cache to avoid rebuilding DB every time
video_cache = {}

class Query(BaseModel):
    video_id: str
    question: str

@app.post("/ask")
async def ask(query: Query):
    video_id = query.video_id

    # Build DB only once per video
    if video_id not in video_cache:
        text = get_transcript(video_id)
        db = build_db(text)
        video_cache[video_id] = db

    db = video_cache[video_id]
    answer = ask_rag(db, query.question)

    return {"answer": answer}