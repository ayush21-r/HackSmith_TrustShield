#!/bin/bash
# TrustShield Setup Script - Run from project root

echo "🛡️  TrustShield - Setting up application..."

# Setup Backend
echo ""
echo "📦 Installing backend dependencies..."
cd backend
npm install

echo "🗄️  Setting up database..."
npx prisma generate
npx prisma migrate dev --name init 2>/dev/null || true
npm run seed

echo ""
echo "✅ Backend setup complete!"
echo "   Start with: cd backend && npm start"

# Setup Frontend
echo ""
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install

echo ""
echo "✅ Frontend setup complete!"
echo "   Start with: cd frontend && npm run dev"

echo ""
echo "🎉 TrustShield is ready!"
echo ""
echo "📖 To run the application:"
echo "   Terminal 1: cd backend && npm start (or npm run dev)"
echo "   Terminal 2: cd frontend && npm run dev"
echo ""
echo "🌐 Access at:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5000"
echo ""
echo "👤 Demo Credentials:"
echo "   Employee: employee@example.com / password123"
echo "   HR:       hr@example.com / password123"
