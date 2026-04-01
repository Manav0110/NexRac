#!/bin/bash
echo "🚀 Starting NexRec — Combined Recommendation System"
echo ""

# Install server deps
echo "📦 Installing server dependencies..."
cd server && npm install --silent
cd ..

# Install client deps
echo "📦 Installing client dependencies..."
cd client && npm install --silent
cd ..

echo ""
echo "✅ Dependencies installed!"
echo ""
echo "🌐 Backend: http://localhost:5000"
echo "🎨 Frontend: http://localhost:5173"
echo ""

# Start both servers
cd server && node index.js &
SERVER_PID=$!

cd client && npx vite &
CLIENT_PID=$!

echo "Both servers running. Press Ctrl+C to stop."
wait
