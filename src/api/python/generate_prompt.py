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
        I am an expert at generating first person narratives. Based on the user input, I will generate a scenario that the user can roleplay with. The first person will be the system, who will converse with the user.
        Output Format:
        - All responses must be in JSON format
        - The scenario should always start with "In this scenario, I am acting as..."
        Example format:
        {
            "response": [
                {
                    "Scenario": "In this scenario, I am acting as..."
                }
            ]
        }
        
        Return ONLY valid JSON matching this exact format. Do not include any additional text or explanations.
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
        
        print("4. OpenAI Response received")
        
        try:
            content = scenario_response.choices[0].message.content
            print("Raw response content:", content)
            parsed_content = json.loads(content)
            
            # Validate response format
            if not isinstance(parsed_content, dict) or "response" not in parsed_content:
                raise ValueError("Response missing required 'response' field")
            if not isinstance(parsed_content["response"], list) or not parsed_content["response"]:
                raise ValueError("Response must contain a non-empty array")
            if "Scenario" not in parsed_content["response"][0]:
                raise ValueError("Response missing required 'Scenario' field")
            
            print("5. JSON parsed and validated successfully")
            return parsed_content
            
        except json.JSONDecodeError as e:
            print(f"JSON parsing error: {str(e)}")
            print(f"Failed to parse content: {content}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to parse response as JSON: {str(e)}"
            )
        except ValueError as e:
            print(f"Validation error: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Invalid response format: {str(e)}"
            )
        
    except Exception as e:
        print(f"Error in generate_text: {type(e).__name__}, {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
