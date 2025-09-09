#!/bin/bash

# NewsPlay Development Startup Script
echo "🚀 Starting NewsPlay Development Environment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the NewsPlay root directory"
    exit 1
fi

# Check if backend directory exists
if [ ! -d "backend" ]; then
    echo "❌ Error: Backend directory not found"
    exit 1
fi

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "⚠️  Port $1 is already in use"
        return 1
    else
        echo "✅ Port $1 is available"
        return 0
    fi
}

# Check ports
echo "🔍 Checking ports..."
check_port 3001
check_port 5173

# Install backend dependencies if needed
echo "📦 Installing backend dependencies..."
cd backend
if [ ! -d "node_modules" ]; then
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install backend dependencies"
        exit 1
    fi
else
    echo "✅ Backend dependencies already installed"
fi
cd ..

# Install frontend dependencies if needed
echo "📦 Installing frontend dependencies..."
if [ ! -d "node_modules" ]; then
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install frontend dependencies"
        exit 1
    fi
else
    echo "✅ Frontend dependencies already installed"
fi

# Check for environment file
echo "🔧 Checking environment configuration..."
if [ ! -f "backend/.env" ]; then
    if [ -f "backend/env.example" ]; then
        echo "📝 Creating .env file from example..."
        cp backend/env.example backend/.env
        echo "⚠️  Please edit backend/.env with your API keys"
    else
        echo "❌ No environment file found. Please create backend/.env"
        exit 1
    fi
else
    echo "✅ Environment file found"
fi

echo ""
echo "🎉 Setup complete! Starting servers..."
echo ""
echo "📱 Frontend will be available at: http://localhost:5173"
echo "🔧 Backend API will be available at: http://localhost:3001"
echo "📊 Health check: http://localhost:3001/health"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Start backend server in background
echo "🚀 Starting backend server..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start frontend server
echo "🚀 Starting frontend server..."
npm run dev &
FRONTEND_PID=$!

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ Servers stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Wait for processes
wait
