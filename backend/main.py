import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="ProductPilot API",
    description="Backend engine for transforming product ideas into execution plans.",
    version="1.0.0"
)

# Configure CORS for React frontend
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "healthy", "service": "ProductPilot API"}

@app.get("/health")
def health_check():
    return {"status": "ok"}
