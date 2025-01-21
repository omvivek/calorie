import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import openai
import logging
import re
import json

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow requests from all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Set OpenAI API key
openai.api_key = os.environ.get("OPENAI_API_KEY")

# Root endpoint
@app.get("/")
async def root():
    return {"message": "Welcome to the Calorie Estimation API!"}

# Define request model
class FoodRequest(BaseModel):
    food_items: str

# Endpoint to get calorie information
@app.post("/get-calories/")
async def get_calories(request: FoodRequest):
    try:
        # Validate input
        if not request.food_items.strip():
            raise HTTPException(
                status_code=400,
                detail="Food items input cannot be empty.",
            )

        # Prepare the prompt for OpenAI
        prompt = f"Provide detailed nutritional information for the following food items in a JSON format: {request.food_items}"

        # Call OpenAI API
        response =  openai.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": prompt},
            ],
            
        )
        # print(response)
        # Extract the content of the response
        raw_result = response.choices[0].message.content.strip()
        
         # Extract JSON content from the response
        try:
            # Use regex to extract JSON block
            json_match = re.search(r"{.*}", raw_result, re.DOTALL)
            if not json_match:
                raise ValueError("JSON block not found in response.")

            # Parse JSON content
            parsed_result = json.loads(json_match.group())
        except (ValueError, json.JSONDecodeError) as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to parse JSON from OpenAI response: {str(e)}",
            )

        # Return parsed JSON
        return parsed_result

    except Exception as e:
        logging.error(f"An unexpected error occurred: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"An unexpected error occurred: {str(e)}",
        )
