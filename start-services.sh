#!/bin/bash
# Start backend
cd backend
npm start &
echo "Backend started on port 3002"

# Wait a moment for backend to initialize
sleep 3

# Start frontend
cd ../frontend
PORT=3006 npm start

# to start = ./start-services.sh