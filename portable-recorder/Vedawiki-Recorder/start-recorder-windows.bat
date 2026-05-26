@echo off
setlocal
cd /d "%~dp0"

if not exist sessions mkdir sessions

where py >nul 2>nul
if %ERRORLEVEL% EQU 0 (
  set "PY=py -3"
) else (
  set "PY=python"
)

echo Vedawiki Field Recorder
echo Creating local Python environment if needed...
%PY% -m venv .venv
if errorlevel 1 goto python_error

call ".venv\Scripts\activate.bat"
python -m pip install --upgrade pip
python -m pip install -r recorder\requirements.txt
if errorlevel 1 goto dependency_error

set "VEDAWIKI_SESSIONS_DIR=%CD%\sessions"
start "Vedawiki Recorder API" "%CD%\start-api-windows.bat"

echo.
echo Plug in an Xbox-compatible controller.
echo Logs will be written to: %VEDAWIKI_SESSIONS_DIR%
echo Press Ctrl+C in this window to stop recording.
echo.
python recorder\recorder.py --sessions-dir "%VEDAWIKI_SESSIONS_DIR%"
goto end

:python_error
echo Could not start Python. Install Python 3.10+ and try again.
pause
exit /b 1

:dependency_error
echo Could not install recorder dependencies.
pause
exit /b 1

:end
pause
