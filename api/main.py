import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
import logging


load_dotenv()

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Allow requests from React app
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],  
)


client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))


class FoodRequest(BaseModel):
    food_items: str


@app.get("/")
async def root():
    
    return {"message": "Welcome to the Calorie Estimation API!"}


@app.post("/get-calories/")
async def get_calories(request: FoodRequest):
   
    try:
        if not request.food_items.strip():
            raise HTTPException(
                status_code=400,
                detail="Food items input cannot be empty.",
            )
        
       
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": f"Estimate the total calorie count for the following food items: {request.food_items}"}
            ],
        )

        
        result = response['choices'][0]['message']['content'].strip()
        return {"calories": result}

    except Exception as e:
        logging.error(f"An unexpected error occurred: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"An unexpected error occurred: {str(e)}",
        )
