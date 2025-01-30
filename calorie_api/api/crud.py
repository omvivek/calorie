from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from dependencies import get_db, oauth2_scheme
from models import User, SearchHistory
from schemas import UserCreate, SearchHistoryCreate
from utils import decode_access_token, verify_password
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError

# Create a new user
def create_user(db: Session, user: UserCreate):
    db_user = User(username=user.username, email=user.email, password=user.password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# Authenticate a user
def authenticate_user(db: Session, username: str, password: str):
    user = db.query(User).filter(User.username == username).first()
    if user and verify_password(password, user.password):
        return user
    return None

# Save search history
def create_search_history(db: Session, user_id: int, history: SearchHistoryCreate):
    db_history = SearchHistory(user_id=user_id, query=history.food_items, response=history.response)
    db.add(db_history)
    db.commit()
    db.refresh(db_history)
    return db_history

# Get user search history
def get_user_history(db: Session, user_id: int):
    return db.query(SearchHistory).filter(SearchHistory.user_id == user_id).all()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")  # URL for login endpoint

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    #print(f"Received token: {token}")
    try:
        payload = decode_access_token(token)  # Decode the JWT token
        #print(f"Decoded token payload: {payload}")
        user_id = payload.get("sub")  # Extract user ID from the token payload
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")