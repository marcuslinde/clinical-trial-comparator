from fastapi import FastAPI
from contextlib import asynccontextmanager
from src.db.main import init_db
from src.trials.routes import router as trials_router

@asynccontextmanager
async def lifespan(app: FastAPI):
  print("Starting up...")
  init_db()
  yield
  print("Shutting down...")

app = FastAPI(
  title= "Trials Dashboard",
  lifespan=lifespan
)

app.include_router(trials_router)