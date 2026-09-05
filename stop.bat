@echo off
setlocal enabledelayedexpansion

call :stopPort 5173 "student app"
call :stopPort 8443 "company dashboard"

pause
exit /b

:stopPort
set PORT=%~1
set LABEL=%~2
set FOUND=0
set KILLED=
rem netstat lists an IPv4 and an IPv6 row for the same process, so dedupe by PID.
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":%PORT% " ^| findstr "LISTENING"') do call :killPid %%p "%LABEL%" %PORT%
if "!FOUND!"=="0" echo No %LABEL% dev server found on port %PORT%.
exit /b

:killPid
echo !KILLED! | findstr /c:"[%1]" >nul
if errorlevel 1 (
    echo Stopping %~2 on port %3 ^(PID %1^)...
    taskkill /PID %1 /F >nul 2>&1
    set KILLED=!KILLED![%1]
    set FOUND=1
)
exit /b
