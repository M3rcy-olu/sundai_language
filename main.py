from dotenv import load_dotenv
import os

print("Current working directory:", os.getcwd())
print("Environment variables before load:", bool(os.getenv("OPENAI_API_KEY")))
load_dotenv()  # Explicitly specify the .env.local file
print("Environment variables after load:", bool(os.getenv("OPENAI_API_KEY")))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.api.python.generateLLM import router as generateLLM_router
from src.api.python.elevenlabsTTS import router as elevenlabsTTS_router
from src.api.python.generate_prompt import router as generate_prompt_router
from src.api.python.speech_router import router as speech_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(generateLLM_router, prefix="/api")
app.include_router(elevenlabsTTS_router, prefix="/api")
app.include_router(speech_router, prefix="/api/speech")
app.include_router(generate_prompt_router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "API is running"}

@app.get("/test")
async def test():
    return {
        "status": "ok",
        "api_key_present": bool(os.getenv("OPENAI_API_KEY")),
        "current_dir": os.getcwd()
    }