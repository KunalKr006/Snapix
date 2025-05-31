@echo off
echo Starting Snapix servers...

REM Kill any existing processes on ports 3000 and 5000
echo Stopping any existing servers...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
  taskkill /F /PID %%a 2>nul
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do (
  taskkill /F /PID %%a 2>nul
)

REM Start backend server
echo Starting backend server...
start cmd /k "cd backend && npm run dev"

REM Wait a moment to ensure backend starts first
timeout /t 5

REM Start frontend server
echo Starting frontend server...
start cmd /k "cd frontend && npm start"

echo Servers started! The application should open in your browser shortly.
echo Backend is running on http://localhost:5000
echo Frontend is running on http://localhost:3000

REM Add remote origin to backend
echo Adding remote origin to backend...
cd backend
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/KunalKr006/Snapix.git
git push -u origin main # or master, depending on your default branch name 