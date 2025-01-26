from fastapi import APIRouter, HTTPException
# from src.api.models.generate import GenerateRequest
import json
import openai
import os
# from pydantic import BaseModel

# Ensure API key is set
openai.api_key = os.getenv("OPENAI_API_KEY")
if openai.api_key is None:
    raise ValueError("OpenAI API key not found")


# Initialize the router
router = APIRouter()

@router.post("/api/generateResponse")
async def generate_text(request):
    # System prompt for consistent output formatting
    system_prompt = """
    You are a language instructor engaging with a student in a roleplay where you act as a cashier. 
    The student will attempt to buy a product from you in Spanish. Your role is to respond in Spanish, 
    correct any mistakes, and provide explanations in English.

    Your response should include:
    1. The corrected Spanish sentence, incorporating natural language, including slang if appropriate.
    2. A clear, detailed explanation of the corrections in English.

    Format your output as JSON with the following structure:
    {
        "response": [
            {
                "Spanish": "Corrected Spanish sentence here",
                "English": "Explanation of corrections here"
            }
        ]
    }
    """ 

    try:
        response = openai.ChatCompletion.create(
            model="gpt-4",  # Check if this model name is correct for your case
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": request.user_prompt}
            ]
        )

        # Assuming response.choices[0].message['content'] is the text result
        story_json = json.loads(response['choices'][0]['message']['content'])  # Parse as JSON if it's in that format
        return story_json
    except Exception as e:
        # Handle errors and send HTTP 500 response
        raise HTTPException(status_code=500, detail=str(e))
