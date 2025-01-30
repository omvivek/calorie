import os
import re
import json
import logging
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Depends, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session 
from database import SessionLocal, engine
from models import Base, User
from schemas import UserCreate, SearchHistoryCreate, UserResponse
from crud import create_user, authenticate_user, create_search_history, get_user_history, get_current_user
import openai
from pydantic import BaseModel
from initialize_db import initialize_tables
from schemas import UserResponse
from fastapi.encoders import jsonable_encoder
from utils import hash_password, verify_password, create_access_token, decode_access_token
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.security import OAuth2PasswordBearer

# initialize_tables()  # Call this to ensure the tables are created

# Initialize OAuth2PasswordBearer
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Set OpenAI API key
openai.api_key = os.environ.get("OPENAI_API_KEY")

# Create database tables
Base.metadata.create_all(bind=engine)

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Root endpoint
@app.get("/")
async def root():
    return {"message": "Welcome to the Calorie Estimation and User Management API!"}

# User registration
@app.post("/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    existing_user_by_email = db.query(User).filter(User.email == user.email).first()
    if existing_user_by_email:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    existing_user_by_username = db.query(User).filter(User.username == user.username).first()
    if existing_user_by_username:
        raise HTTPException(status_code=400, detail="Username already taken")

    user.password = hash_password(user.password)  # Hash the password
    return create_user(db, user)

# User login
@app.post("/login")
def login(body: dict = Body(...), db: Session = Depends(get_db)):
    username = body.get("username")
    password = body.get("password")
    if not username or not password:
        raise HTTPException(status_code=400, detail="Username and password are required")
    user = authenticate_user(db, username, password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token(data={"sub": user.id})
    return {"access_token": token, "token_type": "bearer"}

# Route to get all users
@app.get("/users")
def get_users(db: Session = Depends(get_db)):
    users = db.query(User).all()  # Query all users
    # Serialize using Pydantic schema
    users_response = [UserResponse.from_orm(user) for user in users]
    return JSONResponse(content=jsonable_encoder(users_response))

# Save search history and fetch calorie information
@app.post("/get-calories/")
async def get_calories(request: SearchHistoryCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        # Replace with actual user ID from token after authentication
        user_id = current_user.id  # Mock user ID

        # Validate input
        if not request.food_items.strip():
            raise HTTPException(
                status_code=400,
                detail="Food items input cannot be empty.",
            )

        # Prepare the prompt for OpenAI
        prompt = (
            f"Provide detailed nutritional information for the following food items in a JSON format. Ensure the response contains ONLY valid JSON with no additional text: {request.food_items}"
        )

        # Call OpenAI API
        response = openai.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": prompt},
            ],
        )

        # Extract the content of the response
        raw_result = response.choices[0].message.content.strip()
        #print(f"Raw OpenAI Response: {raw_result}")

        # Parse the response
        try:
            parsed_result = json.loads(raw_result)
        except json.JSONDecodeError:
            json_match = re.search(r"{.*}", raw_result, re.DOTALL)
            if json_match:
                try:
                    parsed_result = json.loads(json_match.group())
                except json.JSONDecodeError as e:
                    raise HTTPException(
                        status_code=500,
                        detail=f"Failed to parse JSON from extracted block: {str(e)}"
                    )
            else:
                raise HTTPException(
                    status_code=500,
                    detail="Failed to find a JSON block in the response."
                )

        # Save to database
        create_search_history(
            db, 
            user_id, 
            SearchHistoryCreate(food_items=request.food_items, response=json.dumps(parsed_result))
        )

        # Return parsed JSON
        return parsed_result

    except Exception as e:
        logging.error(f"An unexpected error occurred: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"An unexpected error occurred: {str(e)}",
        )

# Get user search history
@app.get("/history")
def history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Replace with actual user ID from token after authentication
    return {"search_history": get_user_history(db, current_user.id)}


@app.get("/profile")
async def get_profile(
    current_user: User = Depends(get_current_user),  # Auth middleware
    db: Session = Depends(get_db)
):
    # Query the current user's details from the database
    #print("current user",current_user)
    #print(type(current_user))
    user = db.query(User).filter(User.id == current_user.id).first()



    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "username": user.username,
        "email": user.email,
        "created_at": user.created_at
    }