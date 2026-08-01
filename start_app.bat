@echo off
cd /d "%~dp0"
where py >nul 2>&1
if errorlevel 1 goto use_python
py -3 server.py
goto end

:use_python
python server.py
if errorlevel 1 pause

:end
