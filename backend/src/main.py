from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
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
    title="Trials Dashboard",
    lifespan=lifespan
)

# CORS
origins = [
    # Local Development (Vite Defaults)
    "http://localhost:5173",
    "http://127.0.0.1:5173",

    # Production
    "https://clinical-trial-comparator.vercel.app"
]

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True, # Allow cookies/auth headers
    allow_methods=["*"],    # Allow all methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],    # Allow all headers
)

app.include_router(trials_router)