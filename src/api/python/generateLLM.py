from fastapi import APIRouter, HTTPException
import json
from openai import OpenAI
import os
from pydantic import BaseModel

# Initialize the OpenAI client
api_key = os.getenv("OPENAI_API_KEY")
if api_key is None:
    raise ValueError("OpenAI API key not found")

client = OpenAI(api_key=api_key)

# Initialize the router
router = APIRouter()

# Add request model
class GenerateRequest(BaseModel):
    user_prompt: str
    scenario_prompt: str
@router.post("/generateResponse")
async def generate_text(request: GenerateRequest):
    """
    This function generates a response from the OpenAI API based on the user's prompt.
    It uses the OpenAI API to generate a response to the user's prompt.
    """
    
    try:
        # System prompt for consistent output formatting
        
        system_prompt = """
        I am Ella, a language instructor specializing in french. My role is to roleplay scenarios with the student, helping them practice practical conversations in french. 
        {scenario_prompt}

        I will respond naturally in french, engaging in the roleplay.
        After the student’s **french input**, I will analyze **only the student's input** (not my own response) in English, providing feedback on their grammar, vocabulary, and structure. 

        I will provide the student's input as it is, followed by my natural french response. After that, I will give feedback on the student's french in English.

        Output Format:
        - All responses must be in JSON format.
        {
            "response": [
                {
                    "Student_french": "Student's french input here",
                    "french_Response": "My french response here",
                    "English_Analysis": "English analysis of the student's french input here."
                }
            ]
        }
        """ 
        # Generate the response 
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
