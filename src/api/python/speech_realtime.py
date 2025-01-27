# Speech Realtime
# The accuracy of the transcription is not great. This would be an area for improvement.

import asyncio
import pyaudio
import numpy as np
import sounddevice as sd
from dotenv import load_dotenv
import os
import wave
import tempfile
# import whisper  # Commented out as we'll use OpenAI API instead
import torch
from openai import OpenAI  # Add OpenAI client import
from scipy import signal
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# REPLICATE CODE
# import replicate

# input = {
#     "audio": "https://replicate.delivery/mgxm/e5159b1b-508a-4be4-b892-e1eb47850bdc/OSR_uk_000_0050_8k.wav"
# }

# output = replicate.run(
#     "openai/whisper:8099696689d249cf8b122d833c36ac3f75505c666a395ca40ef26f68e7d3d16e",
#     input=input
# )
# print(output)

class AudioHandler:
    def __init__(self):
        # print("Loading Whisper model...")
        # self.model = whisper.load_model("medium")  # Comment out local model

        self.client = OpenAI(
                api_key=os.getenv('OPENAI_API_KEY'))
        self.CHUNK = 2048  # Reduced from 4096 for more frequent sampling
        self.FORMAT = pyaudio.paFloat32
        self.CHANNELS = 1
        self.RATE = 16000  # 16kHz for Whisper compatibility
        self.p = pyaudio.PyAudio()
        self.buffer = []
        self.BUFFER_SECONDS = 4.0  # Increased from 3.0 for better context
        self.SILENCE_THRESHOLD = 0.09  # Adjusted for better speech detection
        
        print("\nAvailable Audio Devices:")
        for i in range(self.p.get_device_count()):
            dev = self.p.get_device_info_by_index(i)
            print(f"[{i}] {dev['name']}")
        
    async def capture_audio(self):
        stream = self.p.open(
            format=self.FORMAT,
            channels=self.CHANNELS,
            rate=self.RATE,
            input=True,
            frames_per_buffer=self.CHUNK
        )
        
        print("\nStart speaking... (Press Ctrl+C to stop)")
        chunks_per_buffer = int((self.RATE * self.BUFFER_SECONDS) / self.CHUNK)
        buffer_count = 0
        
        while True:
            try:
                self.buffer = []
                max_level = 0
                
                for _ in range(chunks_per_buffer):
                    data = stream.read(self.CHUNK, exception_on_overflow=False)
                    audio_data = np.frombuffer(data, dtype=np.float32)
                    current_level = np.max(np.abs(audio_data))
                    max_level = max(max_level, current_level)
                    self.buffer.append(audio_data)
                
                buffer_count += 1
                level_indicator = "█" * int(max_level * 50)
                status = "SPEECH DETECTED" if max_level > self.SILENCE_THRESHOLD else "silence"
                print(f"Buffer {buffer_count} | Level: {level_indicator} {max_level:.4f} | Status: {status}", end='\r')
                
                if max_level > self.SILENCE_THRESHOLD:
                    combined_audio = np.concatenate(self.buffer)
                    yield combined_audio
                
            except Exception as e:
                print(f"\nError capturing audio: {e}")
                break

    def save_audio_chunk(self, audio_data, filename):
        """Save audio data to a WAV file for API processing"""
        try:
            logger.info(f"Saving audio chunk: shape={audio_data.shape}, max={np.max(np.abs(audio_data)):.4f}")
            audio_data_int = (audio_data * 32767).astype(np.int16)
            with wave.open(filename, 'wb') as wf:
                wf.setnchannels(self.CHANNELS)
                wf.setsampwidth(2)  # 2 bytes for int16
                wf.setframerate(self.RATE)
                wf.writeframes(audio_data_int.tobytes())
            logger.info(f"Successfully saved audio to {filename}")
        except Exception as e:
            logger.error(f"Error saving audio chunk: {e}")
            raise
        
    async def transcribe_audio(self, audio_data):
        """Transcribe audio data using Whisper API"""
        try:
            logger.info(f"Starting transcription: input shape={audio_data.shape}, max amplitude={np.max(np.abs(audio_data)):.4f}")
            
            # Add audio preprocessing
            audio_data = self.preprocess_audio(audio_data)
            logger.info(f"After preprocessing: shape={audio_data.shape}, max amplitude={np.max(np.abs(audio_data)):.4f}")
            
            with tempfile.NamedTemporaryFile(suffix='.wav', delete=True) as temp_audio:
                self.save_audio_chunk(audio_data, temp_audio.name)
                logger.info(f"Temp file size: {os.path.getsize(temp_audio.name)} bytes")
                
                with open(temp_audio.name, 'rb') as audio_file:
                    logger.info("Sending request to OpenAI Whisper API")
                    response = self.client.audio.transcriptions.create(
                        model="whisper-1",
                        file=audio_file,
                        language="en",
                        temperature=0.0,  # Reduced from default for more deterministic output
                    )
                    
                transcript = response.text.strip()
                logger.info(f"Received transcript: '{transcript}'")
                return transcript
                
        except Exception as e:
            logger.error(f"Error in transcription: {e}")
            return ""

    def preprocess_audio(self, audio_data):
        """Preprocess audio data for better transcription"""
        try:
            logger.info("Starting audio preprocessing")
            
            # Normalize audio
            max_amplitude = np.max(np.abs(audio_data))
            logger.info(f"Original max amplitude: {max_amplitude:.4f}")
            if max_amplitude > 0:
                audio_data = audio_data / max_amplitude
            
            # Apply basic noise reduction
            noise_floor = np.mean(np.abs(audio_data[:1000]))
            logger.info(f"Estimated noise floor: {noise_floor:.4f}")
            audio_data = np.where(np.abs(audio_data) < noise_floor * 2, 0, audio_data)
            
            # Apply simple low-pass filter
            b, a = signal.butter(4, 0.8, btype='low')
            audio_data = signal.filtfilt(b, a, audio_data)
            
            logger.info(f"After preprocessing: max amplitude={np.max(np.abs(audio_data)):.4f}")
            return audio_data
            
        except Exception as e:
            logger.error(f"Error in preprocessing: {e}")
            raise

async def main():
    audio_handler = AudioHandler()
    
    print("=== Real-time Speech Recognition ===")
    print("This program will:")
    print("1. Capture your voice in real-time")
    print("2. Transcribe speech when detected")
    print("3. Display transcriptions in real-time")
    print("=====================================")
    
    try:
        async for audio_chunk in audio_handler.capture_audio():
            try:
                # Transcribe the audio chunk
                transcript = await audio_handler.transcribe_audio(audio_chunk)
                
                if transcript:
                    print(f"\nTranscript: {transcript}")
                
            except Exception as e:
                print(f"\nError during processing: {str(e)}")
                continue
                    
    except KeyboardInterrupt:
        print("\n\nStopping the program...")
    finally:
        print("\n=== Session Ended ===")

if __name__ == "__main__":
    asyncio.run(main()) 