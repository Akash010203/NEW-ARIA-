@echo off
title Aria — AI College Companion
color 0C

echo.
echo  ========================================
echo   ARIA — AI for College Students
echo   Starting all services...
echo  ========================================
echo.

:: Check if ollama is installed
where ollama >nul 2>&1
if %errorlevel% neq 0 (
  echo  [ERROR] Ollama not found.
  echo  Install from: https://ollama.com
  echo  Then run this script again.
  pause
  exit
)

:: Check if node is installed
where node >nul 2>&1
if %errorlevel% neq 0 (
  echo  [ERROR] Node.js not found.
  echo  Install from: https://nodejs.org
  pause
  exit
)

:: Check if python is installed
where python >nul 2>&1
if %errorlevel% neq 0 (
  echo  [ERROR] Python not found.
  echo  Install from: https://python.org
  pause
  exit
)

echo  [1/3] Starting Ollama AI...
start "Ollama AI" cmd /k "ollama serve"
timeout /t 3 /nobreak >nul

echo  [2/3] Starting FastAPI backend...
start "Aria Backend" cmd /k "cd /d %~dp0backend && pip install -r requirements.txt -q && uvicorn main:app --reload --port 8000"
timeout /t 4 /nobreak >nul

echo  [3/3] Starting Next.js frontend...
start "Aria Frontend" cmd /k "cd /d %~dp0 && npm install --silent && npm run dev"
timeout /t 5 /nobreak >nul

echo.
echo  ========================================
echo   All services starting in new windows!
echo.
echo   Website:  http://localhost:3000
echo   Backend:  http://localhost:8000/docs
echo   AI Test:  http://localhost:3000/test
echo  ========================================
echo.
echo  Opening browser in 8 seconds...
timeout /t 8 /nobreak >nul
start http://localhost:3000

echo  Done! You can close this window.
pause
