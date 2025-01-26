from fastapi import FastAPI
from api.python.generateLLM import router as generateLLM_router

# Initialize the FastAPI application
app = FastAPI()

# Include the routes from the generate API file
app.include_router(generateLLM_router)
