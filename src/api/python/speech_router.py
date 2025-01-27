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
    connection_closed = False
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
                logger.info(f"Received audio: shape={audio_np.shape}, max amplitude={np.max(np.abs(audio_np)):.4f}")
                
                # Check if this is a complete recording
                if audio_data.get('complete', False):
                    logger.info("Processing complete recording...")
                    await websocket.send_json({
                        "status": "processing",
                        "message": "Starting audio processing..."
                    })
                    
                    try:
                        # Process the complete audio
                        if np.max(np.abs(audio_np)) > audio_handler.SILENCE_THRESHOLD:
                            await websocket.send_json({
                                "status": "processing",
                                "message": "Transcribing audio..."
                            })
                            
                            transcript = await audio_handler.transcribe_audio(audio_np)
                            if transcript:
                                logger.info(f"Sending complete transcript: '{transcript}'")
                                await websocket.send_json({
                                    "status": "success",
                                    "transcript": transcript
                                })
                            else:
                                logger.info("No transcript generated")
                                await websocket.send_json({
                                    "status": "error",
                                    "message": "No speech detected in recording"
                                })
                        else:
                            logger.info("Audio too quiet, no transcription performed")
                            await websocket.send_json({
                                "status": "error",
                                "message": "Audio level too low"
                            })
                    except Exception as e:
                        logger.error(f"Error processing audio: {e}")
                        await websocket.send_json({
                            "status": "error",
                            "message": str(e)
                        })
            
            except WebSocketDisconnect:
                logger.info(f"Client {client_id} disconnected gracefully")
                connection_closed = True
                break
            except Exception as e:
                logger.error(f"Error in websocket for client {client_id}: {e}")
                try:
                    await websocket.send_json({
                        "status": "error",
                        "message": str(e)
                    })
                except Exception as send_error:
                    logger.error(f"Failed to send error message to client {client_id}")
                break
    finally:
        if not connection_closed:
            logger.info(f"Closing WebSocket connection for client {client_id}")
            try:
                await websocket.close()
            except Exception as e:
                # Only log if it's not a "WebSocket already closed" type of error
                if "already closed" not in str(e).lower():
                    logger.error(f"Error closing websocket for client {client_id}: {e}")
        logger.info(f"WebSocket connection closed for client {client_id}")
