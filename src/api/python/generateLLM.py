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
    try:
        # System prompt for consistent output formatting
        system_prompt = """
        I am Ella, a language instructor engaging with a student in a roleplay where I act as a cashier. 
        The student will attempt to buy a product from me in Spanish. My role is to respond to the student in Spanish, 
        correct any mistakes, and provide explanations in English.

        My response should include:
        1. The corrected Spanish sentence, incorporating natural language, including slang if appropriate.
        2. A clear, detailed explanation of the corrections in English.

        Format my output as JSON with the following structure:
        {
            "response": [
                {
                    "Spanish": "Corrected Spanish sentence here",
                    "English": "Explanation of corrections here"
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
        print("4. OpenAI Response received")
        
        
        parsed_content = json.loads(response.choices[0].message.content)

        print("5. JSON parsed successfully")
        return parsed_content
        
    except Exception as e:
        print(f"Error in generate_text: {type(e).__name__}, {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
