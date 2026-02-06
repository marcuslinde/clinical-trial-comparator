from fastapi import FastAPI
from contextlib import asynccontextmanager
from src.db.main import init_db

@asynccontextmanager
async def lifespan(app: FastAPI):
  print("Starting up...")
  init_db()
  yield
  print("Shutting down...")

app = FastAPI(
  title= "Trials Dashboard API",
  lifespan=lifespan
)

@app.get("/ping")
async def ping():
  return {"message": "pong"}