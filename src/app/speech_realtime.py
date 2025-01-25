import asyncio
import pyaudio
import numpy as np
import sounddevice as sd
from dotenv import load_dotenv
import os
import wave
import tempfile
import whisper
import torch

# Load environment variables
load_dotenv('../../.env.local')

class AudioHandler:
    def __init__(self):
        print("Loading Whisper model...")
        self.model = whisper.load_model("base")
        self.CHUNK = 1024 * 4
        self.FORMAT = pyaudio.paFloat32
        self.CHANNELS = 1
        self.RATE = 16000  # 16kHz for Whisper compatibility
        self.p = pyaudio.PyAudio()
        self.buffer = []
        self.BUFFER_SECONDS = 2.0  # Increased buffer for better transcription
        self.SILENCE_THRESHOLD = 0.01
        
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

    async def transcribe_audio(self, audio_data):
        """Transcribe audio data using Whisper"""
        try:
            # Ensure audio data is in the correct format (float32, normalized between -1 and 1)
            audio_data = audio_data.astype(np.float32)
            
            # Use Whisper to transcribe
            result = self.model.transcribe(
                audio_data,
                language="en",
                task="transcribe",
                temperature=0.2,
                fp16=torch.cuda.is_available()
            )
            
            return result["text"].strip()
        except Exception as e:
            print(f"\nError in transcription: {e}")
            return ""

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