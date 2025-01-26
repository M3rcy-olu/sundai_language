import openai
import pygame
import io
import os
from pygame import mixer
from dotenv import load_dotenv

# Load environment variables
load_dotenv('../../.env.local')

class TextToSpeech:
    def __init__(self):
        # Initialize pygame mixer for audio playback
        pygame.init()
        mixer.init()
        
        # Initialize OpenAI client
        self.client = openai.OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        
        # Define available voices
        self.voices = [
            'alloy',    # Neutral and balanced
            'echo',     # Male voice
            'fable',    # British accent
            'onyx',     # Deep and authoritative
            'nova',     # Female voice
            'shimmer'   # Warm and welcoming
        ]

    def speak(self, text, voice="nova", speed=1.0, style=None):
        """
        Convert text to speech using OpenAI's TTS model with style modifications
        :param text: The text to convert to speech
        :param voice: The voice to use (alloy, echo, fable, onyx, nova, shimmer)
        :param speed: Speech speed (0.25 to 4.0)
        :param style: Speaking style (neutral, excited, sad, whispered, angry)
        """
        try:
            # Apply style-based modifications
            if style:
                modified_text, style_speed = self._get_style_settings(text, style)
                # Combine the user's speed with the style speed
                speed = speed * style_speed
            else:
                modified_text = text
                
            # Validate voice selection
            if voice not in self.voices:
                voice = 'nova'  # default voice
                
            # Validate speed (OpenAI accepts 0.25 to 4.0)
            speed = max(0.25, min(4.0, speed))

            # Get the speech audio from OpenAI
            response = self.client.audio.speech.create(
                model="tts-1",
                voice=voice,
                input=modified_text,
                speed=speed
            )
            
            # Create a BytesIO object from the audio data
            audio_io = io.BytesIO(response.content)
            
            # Load and play the audio
            mixer.music.load(audio_io)
            mixer.music.play()
            
            # Wait for the audio to finish playing
            while mixer.music.get_busy():
                pygame.time.Clock().tick(10)
                
        except Exception as e:
            print(f"Error in text-to-speech conversion: {str(e)}")

    def _get_style_settings(self, text, style):
        """
        Get speed multiplier and modify text based on speaking style
        Returns: (modified_text, speed_multiplier)
        """
        style_settings = {
            'neutral': (text, 1.0),                          # Normal speed, original text
            'excited': (f"Wow! {text}!", 1.3),              # Faster, add excitement
            'sad': (f"*sigh* ... {text}", 0.85),            # Slower, add sadness
            'whispered': (text.lower(), 0.8),               # Slower, lowercase for softness
            'angry': (f"{text}!", 1.2),                     # Faster, add intensity
        }
        return style_settings.get(style, (text, 1.0))

    def cleanup(self):
        """Cleanup pygame resources"""
        pygame.quit()

# Example usage
if __name__ == "__main__":
    tts = TextToSpeech()
    
    # Example with different styles using the same voice
    voice = "nova"  # Try with different voices: alloy, echo, fable, onyx, nova, shimmer
    texts = [
        ("Hello! This is normal speech.", "neutral"),
        ("This is so amazing!", "excited"),
        ("I'm not feeling very well today.", "sad"),
        ("I have a secret to tell you.", "whispered"),
        ("This is completely unacceptable!", "angry")
    ]
    
    for text, style in texts:
        print(f"\nPlaying: {style} style with {voice} voice")
        tts.speak(text, voice=voice, style=style)
    
    # Cleanup
    tts.cleanup()
