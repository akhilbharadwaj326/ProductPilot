#!/bin/bash
echo "Starting FastAPI Backend..."
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

echo "Starting React Frontend..."
cd ../frontend
npm install
npm run dev -- --host 0.0.0.0 --port 5173

wait $BACKEND_PID
