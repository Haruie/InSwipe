@echo off
setlocal enabledelayedexpansion
set FOUND=0
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":5173" ^| findstr "LISTENING"') do (
    echo Stopping process %%p on port 5173...
    taskkill /PID %%p /F >nul 2>&1
    set FOUND=1
)
if "!FOUND!"=="0" (
    echo No dev server found running on port 5173.
) else (
    echo Dev server stopped.
)
pause
