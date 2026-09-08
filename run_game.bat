@echo off
setlocal EnableExtensions
cd /d "%~dp0"

if defined PORT goto port_ready
set "PORT=8000"

:find_port
powershell -NoProfile -Command "$c=New-Object Net.Sockets.TcpClient; try {$c.Connect('127.0.0.1',%PORT%); exit 0} catch {exit 1} finally {$c.Dispose()}" >nul 2>&1
if not errorlevel 1 (
  set /a PORT+=1
  goto find_port
)

:port_ready
where py >nul 2>&1
if not errorlevel 1 (
  set "PYTHON=py"
) else (
  where python >nul 2>&1
  if errorlevel 1 (
    echo Python was not found. Install Python from https://www.python.org/downloads/
    pause
    exit /b 1
  )
  set "PYTHON=python"
)

start "" "http://localhost:%PORT%/index.html"
echo Petal is running at http://localhost:%PORT%/index.html
echo Close this window or press Ctrl+C to stop the server.
"%PYTHON%" -m http.server %PORT% --bind 127.0.0.1
pause
