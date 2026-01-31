#!/bin/bash
# TrustShield One-Click Startup for Mac/Linux

echo ""
echo "╔════════════════════════════════════════════╗"
echo "║  🛡️  TrustShield Startup                  ║"
echo "║  Backend: http://localhost:5000            ║"
echo "║  Frontend: http://localhost:3000           ║"
echo "╚════════════════════════════════════════════╝"
echo ""

# Kill existing processes
echo "Cleaning up existing servers..."
lsof -ti:5000 | xargs kill -9 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
lsof -ti:3002 | xargs kill -9 2>/dev/null || true

# Start backend in background
echo "Starting Backend on port 5000..."
cd "$(dirname "$0")/backend"
npm start &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start frontend
echo ""
echo "Starting Frontend on port 3000..."
cd "$(dirname "$0")/frontend"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Both servers are starting!"
echo ""
echo "📖 Once both are running, open your browser:"
echo "   http://localhost:3000"
echo ""
echo "👤 Demo Login:"
echo "   Email: employee@example.com"
echo "   Password: password123"
echo ""

# Wait for both processes
wait
