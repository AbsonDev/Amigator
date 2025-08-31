#!/bin/bash

echo "🚀 Starting Escritor IA Development Environment"
echo "============================================="

# Check if backend dependencies are installed
if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend && npm install && cd ..
fi

# Check if frontend dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

# Check if .env files exist
if [ ! -f "backend/.env" ]; then
    echo "⚠️  Creating backend .env file from example..."
    cp backend/.env.example backend/.env
    echo "📝 Please add your GEMINI_API_KEY to backend/.env"
fi

if [ ! -f ".env" ]; then
    echo "⚠️  Creating frontend .env file from example..."
    cp .env.example .env
fi

echo ""
echo "🎯 Starting servers..."
echo "----------------------"

# Start backend in background
echo "🔧 Starting backend on http://localhost:3001"
cd backend && npm run dev &
BACKEND_PID=$!

# Wait a bit for backend to start
sleep 3

# Start frontend
echo "🎨 Starting frontend on http://localhost:5173"
cd .. && npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Development environment is running!"
echo "======================================"
echo "📱 Frontend: http://localhost:5173"
echo "🔧 Backend:  http://localhost:3001"
echo "📚 API Docs: http://localhost:3001/api-docs (if configured)"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID