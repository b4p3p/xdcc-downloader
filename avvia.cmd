@echo off
cd /d "%~dp0"
set ELECTRON_RUN_AS_NODE=
set "ELECTRON=%~dp0node_modules\electron\dist\electron.exe"
if not exist "%ELECTRON%" (
  echo Dipendenze mancanti: esegui "npm install" in questa cartella.
  pause
  exit /b 1
)
start "" "%ELECTRON%" "%~dp0."
