
from fastapi import APIRouter, HTTPException
import json
from openai import OpenAI
import os
from pydantic import BaseModel
from dotenv import load_dotenv

# Load the .env file
load_dotenv()

# Initialize the OpenAI client
api_key = os.getenv("OPENAI_API_KEY")
if api_key is None:
    raise ValueError("OpenAI API key not found")

client = OpenAI(api_key=api_key)

# Initialize the router
router = APIRouter()

# Add request model
class GenerateRequest(BaseModel):
    user_scenario_prompt: str
@router.post("/generatePrompt")
async def generate_prompt(request: GenerateRequest):
    """
    This function generates a response from the OpenAI API based on the user's prompt.
    It uses the OpenAI API to generate a response to the user's prompt.
    """
    
    try:
        # System prompt for consistent output formatting
        
        scenario_system_prompt = """
        I am an expert at generating first person narratives. Based, on the user input, I will generate a scenario that the user can roleplay with. The first person will be the system, who will converse with the user.
         Output Format:
        - All responses must be in JSON format.
        - The scenario should always start with "In this scenario, I am acting as..."
        {
            "response": [
                {
                    "Scenario": "Scenario here",
                }
            ]
        }
        """

        
        
        # Debug prints
        print("1. Received request:", request.user_scenario_prompt)
        print("2. API Key present:", bool(api_key))
        print("3. API Key value:", api_key[:10] + "..." if api_key else None)
        
        #Creating the scenario prompt
        scenario_response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": scenario_system_prompt},
                {"role": "user", "content": request.user_scenario_prompt}
            ]
        )
        
        print("4. OpenAI Response received", scenario_system_prompt)
        
        
        parsed_content = json.loads(scenario_response.choices[0].message.content)

        print("5. JSON parsed successfully")
        print(parsed_content)
        return parsed_content
        
    except Exception as e:
        print(f"Error in generate_text: {type(e).__name__}, {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


