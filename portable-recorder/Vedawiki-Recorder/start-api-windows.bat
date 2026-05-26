@echo off
setlocal
cd /d "%~dp0"
call ".venv\Scripts\activate.bat"
set "VEDAWIKI_SESSIONS_DIR=%CD%\sessions"
python recorder\server.py
pause
