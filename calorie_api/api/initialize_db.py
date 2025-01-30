from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base

# Specify your database URL (SQLite in this case)
DATABASE_URL = "sqlite:///./app.db"  # Change `app.db` to your desired database file name

# Create the database engine
engine = create_engine(DATABASE_URL)

# Initialize the database tables
def initialize_tables():
    print("Creating all tables in the database...")
    Base.metadata.drop_all(bind=engine)  # This will drop all existing tables
    Base.metadata.create_all(bind=engine)  # This will create all tables
    print("All tables created successfully!")

if __name__ == "__main__":
    initialize_tables()
