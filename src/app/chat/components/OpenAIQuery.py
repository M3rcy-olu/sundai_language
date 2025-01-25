import json
from pydantic import BaseModel
from openai import OpenAI
# from .env.local import OPENAI_GITHUB_TOKEN
GITHUB_TOKEN = process.env.local.OPENAI_GITHUB_TOKEN

client = OpenAI(
    base_url="https://models.inference.ai.azure.com",
    api_key=GITHUB_TOKEN,
)