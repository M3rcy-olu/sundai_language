from elevenlabs import  stream
# from elevenlabs import Voices
from fastapi import APIRouter, HTTPException, Response
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from typing import Optional
from elevenlabs.client import ElevenLabs

# Load the .env file
load_dotenv()

# Set the API key
api_key = os.getenv("ELEVENLABS_API_KEY")
if not api_key:
    print("❌ Error: ELEVENLABS_API_KEY not found in environment variables")
    raise ValueError("ElevenLabs API key not found")
else:
    print("✅ ElevenLabs API key loaded successfully")

# Initialize the router
router = APIRouter()


# Initialize the client
client = ElevenLabs(api_key=api_key)

# Initialize the router
router = APIRouter()

# Add request model
class TTSRequest(BaseModel):
    text: str
    voice_id: Optional[str] = "JBFqnCBsd6RMkjVDRZzb"  # Default voice
    model_id: Optional[str] = "eleven_multilingual_v2"  # Default model

@router.post("/text-to-speech")
async def text_to_speech(request: TTSRequest):
    try:
        audio_stream = client.text_to_speech.convert_as_stream(
            text=request.text,
            voice_id=request.voice_id,
            model_id=request.model_id
        )
        
        # Collect all chunks into a single bytes object
        audio_data = b"".join(chunk for chunk in audio_stream if isinstance(chunk, bytes))
        
        return Response(content=audio_data, media_type="audio/mpeg")
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# # Example usage (if needed)
# if __name__ == "__main__":
#     async def test_tts():
#         text_to_speak = "This is a test of the ElevenLabs API streaming functionality."
#         request = TTSRequest(text=text_to_speak)
#         audio = await text_to_speech(request)
#         print("Test completed successfully")

#     import asyncio
#     asyncio.run(test_tts())
