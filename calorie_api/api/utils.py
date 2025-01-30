import os
from datetime import datetime, timedelta
from jose import JWTError, jwt # type: ignore
from passlib.context import CryptContext
from fastapi import HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
# import secrets
from dotenv import load_dotenv
# Load environment variables
load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440

# print(secrets.token_hex(32))
# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 token URL
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    to_encode["sub"] = str(to_encode["sub"])  # Convert `sub` to string ✅

    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})

    #print(f"Encoding token with data: {to_encode}")  # Debugging
    token = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    #print(f"Generated Token: {token}")  # Debugging
    return token

def decode_access_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        #print(f"Decoded payload: {payload}") 
        return payload
    except JWTError as e:
        #print(f"JWT Decoding Error: {e}")
        raise HTTPException(status_code=401, detail="Invalid or expired token")
