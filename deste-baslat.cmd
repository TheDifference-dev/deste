@echo off
rem deste'yi bu bilgisayarda uygulama penceresinde açar (yerel sunucu: 127.0.0.1:8642)
cd /d "%~dp0"
powershell -NoProfile -WindowStyle Hidden -Command "if (-not (Get-NetTCPConnection -LocalPort 8642 -State Listen -ErrorAction SilentlyContinue)) { Start-Process -WindowStyle Hidden -FilePath python -ArgumentList '-m','http.server','8642','--bind','127.0.0.1' -WorkingDirectory '%~dp0' }"
timeout /t 2 /nobreak >nul
set URL=http://127.0.0.1:8642/index.html
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (start "" "%ProgramFiles%\Google\Chrome\Application\chrome.exe" --app=%URL% & goto :eof)
if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" (start "" "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" --app=%URL% & goto :eof)
start "" %URL%
