from fastapi import APIRouter, HTTPException
# from src.api.models.generate import GenerateRequest
import json
import openai
from openai import OpenAI
import os
from pydantic import BaseModel

# Ensure API key is set
openai.api_key = os.getenv("OPENAI_API_KEY")
if openai.api_key is None:
    raise ValueError("OpenAI API key not found")

client = OpenAI(
    api_key=os.environ.get("OPENAI_API_KEY"), 
)


# Initialize the router
router = APIRouter()

# Add request model
class GenerateRequest(BaseModel):
    user_prompt: str

@router.post("/generateResponse")
async def generate_text(request: GenerateRequest):
    """
    This function generates a response from the OpenAI API based on the user's prompt.
    It uses the OpenAI API to generate a response to the user's prompt.
    """
    try:
        # System prompt for consistent output formatting
        system_prompt = """
        I am Ella, a language instructor specializing in Spanish. My role is to roleplay scenarios with the student, helping them practice practical conversations in Spanish. In this scenario, I am acting as a food server, and the student will order food.

        I will respond naturally in Spanish, engaging in the roleplay.
        After the student’s **Spanish input**, I will analyze **only the student's input** (not my own response) in English, providing feedback on their grammar, vocabulary, and structure. 

        I will provide the student's input as it is, followed by my natural Spanish response. After that, I will give feedback on the student's Spanish in English.

        Output Format:
        - All responses must be in JSON format.
        {
            "response": [
                {
                    "Student_Spanish": "Student's Spanish input here",
                    "Spanish_Response": "My Spanish response here",
                    "English_Analysis": "English analysis of the student's Spanish input here."
                }
            ]
        }
        """ 
        
        # Debug prints
        print("1. Received request:", request.user_prompt)
        print("2. API Key present:", bool(openai.api_key))
        print("3. API Key value:", openai.api_key[:10] + "..." if openai.api_key else None)
        
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": request.user_prompt}
            ]
        )
        print("4. OpenAI Response received", response)
        
        
        parsed_content = json.loads(response.choices[0].message.content)

        print("5. JSON parsed successfully")
        return parsed_content
        
    except Exception as e:
        print(f"Error in generate_text: {type(e).__name__}, {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
