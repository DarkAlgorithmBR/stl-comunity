@echo off
cd /d "%~dp0"
set "NODE_EXE=C:\Program Files\nodejs\node.exe"
if not exist "%NODE_EXE%" set "NODE_EXE=node"
echo Iniciando Estudio 3D em http://127.0.0.1:4173 ...
"%NODE_EXE%" servidor-local.mjs
if errorlevel 1 pause
