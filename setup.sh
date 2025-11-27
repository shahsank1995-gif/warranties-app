#!/bin/bash

# Quick Start Script for Local Development
# Usage: bash setup.sh

echo "🚀 Warranto App - Local Development Setup"
echo "=========================================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+"
    exit 1
fi

echo "✓ Node.js $(node -v)"

# Install frontend dependencies
echo ""
echo "📦 Installing frontend dependencies..."
npm install

# Install backend dependencies
echo ""
echo "📦 Installing backend dependencies..."
cd server
npm install
cd ..

# Create .env.local if not exists
if [ ! -f .env.local ]; then
    echo ""
    echo "📝 Creating .env.local from template..."
    cat > .env.local << EOF
VITE_GOOGLE_GENAI_API_KEY=AIzaSyByO7txWsL2aAX80HjWBehR3OJjZlh0GYM
EMAIL_USER=shahsank1995@gmail.com
EMAIL_PASSWORD=paste-your-gmail-app-password-here
NOTIFICATION_TIME=09:00
NODE_ENV=development
EOF
    echo "⚠️  Please update .env.local with your Gmail App Password"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Update .env.local with Gmail App Password"
echo "   2. Run in terminal 1: cd server && npm start"
echo "   3. Run in terminal 2: npm run dev"
echo "   4. Open http://localhost:5173"
echo ""
echo "📚 For production deployment, see: PRODUCTION_SETUP.md"
