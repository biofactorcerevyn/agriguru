#!/bin/bash

# Development startup script for AgriGuru Unified API Server
# This script runs the API server in development mode without requiring model files

echo "Starting AgriGuru Unified API Server in DEVELOPMENT mode..."
echo "Note: Running without actual ML models - predictions will use random values."
echo ""

# Check if Python virtual environment exists
if [ -d "venv" ]; then
  echo "Using existing virtual environment..."
  source venv/bin/activate
else
  echo "Creating new virtual environment..."
  python -m venv venv
  source venv/bin/activate
  echo "Installing dependencies..."
  pip install -r unified_api_server_requirements.txt
fi

# Run the unified API server
echo "Starting API server on http://localhost:8000"
python unified_api_server.py
