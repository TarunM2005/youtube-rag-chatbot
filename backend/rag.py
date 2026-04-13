from youtube_transcript_api import YouTubeTranscriptApi
from langchain_text_splitters import CharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.llms import Ollama

# Load local LLM
llm = Ollama(model="phi")

# Load embeddings
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

def get_transcript(video_id):
    api = YouTubeTranscriptApi()
    transcript = api.fetch(video_id)

    text = ""
    for t in transcript:
        if "[BLANK_AUDIO]" not in t.text:
            text += f"[{int(t.start)}s] {t.text} "

    return text

def build_db(text):
    splitter = CharacterTextSplitter(chunk_size=800, chunk_overlap=100)
    chunks = splitter.split_text(text)

    db = FAISS.from_texts(chunks, embeddings)
    return db

def ask_rag(db, question):
    docs = db.similarity_search(question, k=6)
    context = " ".join([doc.page_content for doc in docs])

    prompt = f"""
You are an AI assistant.

Answer using context.
If possible, include timestamps like [10s].

Context:
{context}

Question: {question}

Answer:
"""

    return llm.invoke(prompt)