from sqlmodel import SQLModel, Session, create_engine
from src.config import settings

engine = create_engine(
    settings.DATABASE_URL, 
    echo=True,
    pool_pre_ping=True # Helps handle dropped connections in cloud DBs
)

def init_db():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session