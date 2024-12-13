import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
import logging

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI()

# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow requests from React app
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all HTTP headers
)

# Initialize OpenAI client
client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

# Request model
class FoodRequest(BaseModel):
    food_items: str


@app.get("/")
async def root():
    """Root endpoint to test API availability."""
    return {"message": "Welcome to the Calorie Estimation API!"}


@app.post("/get-calories/")
async def get_calories(request: FoodRequest):
    """Endpoint to estimate calorie count for given food items."""
    try:
        if not request.food_items.strip():
            raise HTTPException(
                status_code=400,
                detail="Food items input cannot be empty.",
            )
        
        # Call OpenAI API for calorie estimation
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": f"Estimate the total calorie count for the following food items: {request.food_items}"}
            ],
        )

        # Extract result
        result = response['choices'][0]['message']['content'].strip()
        return {"calories": result}

    except Exception as e:
        logging.error(f"An unexpected error occurred: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"An unexpected error occurred: {str(e)}",
        )
