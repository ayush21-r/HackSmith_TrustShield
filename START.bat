@echo off
REM TrustShield One-Click Startup for Windows

echo.
echo ╔════════════════════════════════════════════╗
echo ║  Shutting down any existing servers...     ║
echo ╚════════════════════════════════════════════╝
echo.

REM Kill processes on ports 5000 and 3000
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do (
  taskkill /PID %%a /F 2>nul
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
  taskkill /PID %%a /F 2>nul
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do (
  taskkill /PID %%a /F 2>nul
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3002') do (
  taskkill /PID %%a /F 2>nul
)

echo.
echo ╔════════════════════════════════════════════╗
echo ║  🛡️  TrustShield Startup                  ║
echo ║  Backend: http://localhost:5000            ║
echo ║  Frontend: http://localhost:3000           ║
echo ╚════════════════════════════════════════════╝
echo.

echo Starting Backend...
cd /d "%~dp0backend"
start "TrustShield Backend" cmd /k npm start

timeout /t 3 /nobreak

echo.
echo Starting Frontend...
cd /d "%~dp0frontend"
start "TrustShield Frontend" cmd /k npm run dev

echo.
echo ✅ Both servers are starting!
echo.
echo 📖 Once both are running, open your browser:
echo    http://localhost:3000
echo.
echo 👤 Demo Login:
echo    Email: employee@example.com
echo    Password: password123
echo.
pause
