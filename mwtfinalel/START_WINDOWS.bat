@echo off
setlocal
cd /d "%~dp0"

echo =============================================
echo            PrepCycle - Windows Start
echo =============================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js was not found. Install Node.js 18+ and run this file again.
  pause
  exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
  echo npm was not found. Reinstall Node.js and run this file again.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo Installing root dependencies...
  call npm install
  if errorlevel 1 goto :error
)
if not exist "backend\node_modules" (
  echo Installing backend dependencies...
  call npm install --prefix backend
  if errorlevel 1 goto :error
)
if not exist "frontend\node_modules" (
  echo Installing frontend dependencies...
  call npm install --prefix frontend
  if errorlevel 1 goto :error
)

echo.
echo Starting PrepCycle backend and frontend...
call npm run dev
if errorlevel 1 goto :error
exit /b 0

:error
echo.
echo PrepCycle could not start. Read the message above, fix the reported issue, and run START_WINDOWS.bat again.
pause
exit /b 1
