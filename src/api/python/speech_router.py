from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from .speech_realtime import AudioHandler
import json
import numpy as np
import base64
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()
audio_handler = AudioHandler()

@router.websocket("/ws/speech")
async def websocket_endpoint(websocket: WebSocket):
    client_id = id(websocket)
    logger.info(f"New WebSocket connection request from client {client_id}")
    await websocket.accept()
    logger.info(f"WebSocket connection accepted for client {client_id}")
    
    try:
        while True:
            try:
                # Receive audio data as base64 string
                data = await websocket.receive_text()
                audio_data = json.loads(data)
                
                # Convert base64 audio to numpy array
                audio_bytes = base64.b64decode(audio_data['audio'])
                audio_np = np.frombuffer(audio_bytes, dtype=np.float32)
                logger.info(f"Received audio chunk: shape={audio_np.shape}, max amplitude={np.max(np.abs(audio_np)):.4f}")
                
                # Process audio if it's above silence threshold
                if np.max(np.abs(audio_np)) > audio_handler.SILENCE_THRESHOLD:
                    logger.info("Audio above silence threshold, processing...")
                    # Transcribe the audio
                    transcript = await audio_handler.transcribe_audio(audio_np)
                    if transcript:
                        logger.info(f"Sending transcript: '{transcript}'")
                        await websocket.send_json({
                            "status": "success",
                            "transcript": transcript
                        })
                else:
                    logger.info("Audio below silence threshold, skipping...")
            
            except WebSocketDisconnect:
                logger.info(f"Client {client_id} disconnected gracefully")
                break
                
    except Exception as e:
        logger.error(f"Error in websocket for client {client_id}: {str(e)}")
        try:
            await websocket.send_json({
                "status": "error",
                "message": str(e)
            })
        except:
            logger.error(f"Failed to send error message to client {client_id}")
    finally:
        try:
            logger.info(f"Closing WebSocket connection for client {client_id}")
            await websocket.close()
        except:
            logger.error(f"Error while closing WebSocket for client {client_id}")
        logger.info(f"WebSocket connection closed for client {client_id}")
