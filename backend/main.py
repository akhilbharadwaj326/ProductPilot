import os
# pyrefly: ignore [missing-import]
from fastapi import FastAPI
# pyrefly: ignore [missing-import]
from fastapi.middleware.cors import CORSMiddleware
# pyrefly: ignore [missing-import]
from dotenv import load_dotenv
import logging

from . import models
from .database import engine
from .routers import ai, projects, scoring, admin, auth

# Setup logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")

load_dotenv()

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ProductPilot API",
    description="Backend engine for transforming product ideas into execution plans.",
    version="1.0.0"
)

# Configure CORS for React frontend
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(projects.router)
app.include_router(ai.router)
app.include_router(scoring.router)
app.include_router(admin.router)
app.include_router(auth.router)

@app.get("/")
def read_root():
    return {"status": "healthy", "service": "ProductPilot API"}

@app.get("/health")
def health_check():
    return {"status": "ok"}
