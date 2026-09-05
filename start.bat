@echo off
cd /d "%~dp0"

echo Starting InSwipe dev servers...
echo.

start "InSwipe student app" /D "%~dp0student-app" cmd /k npm run dev
start "InSwipe company dashboard" /D "%~dp0company-dashboard" cmd /k npm run dev

echo   Student app         http://localhost:5173
echo   Company dashboard   http://localhost:8443
echo.
echo Each server runs in its own window. Close them, or run stop.bat, to stop both.
pause
