@echo off
REM TrustShield Setup Script for Windows - Run from project root

echo.
echo 🛡️  TrustShield - Setting up application...
echo.

REM Setup Backend
echo 📦 Installing backend dependencies...
cd backend
call npm install

echo.
echo 🗄️  Setting up database...
call npx prisma generate
call npx prisma migrate dev --name init
call npm run seed

echo.
echo ✅ Backend setup complete!
echo    Start with: cd backend ^&^& npm start
echo.

REM Setup Frontend
echo 📦 Installing frontend dependencies...
cd ..\frontend
call npm install

echo.
echo ✅ Frontend setup complete!
echo    Start with: cd frontend ^&^& npm run dev
echo.

echo 🎉 TrustShield is ready!
echo.
echo 📖 To run the application:
echo    Terminal 1: cd backend ^&^& npm start (or npm run dev)
echo    Terminal 2: cd frontend ^&^& npm run dev
echo.
echo 🌐 Access at:
echo    Frontend: http://localhost:3000
echo    Backend:  http://localhost:5000
echo.
echo 👤 Demo Credentials:
echo    Employee: employee@example.com / password123
echo    HR:       hr@example.com / password123
echo.
pause
