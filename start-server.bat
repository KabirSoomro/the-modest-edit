@echo off
title The Modest Edit - Local Web Server
cd /d "%~dp0"
echo =======================================================
echo   Starting The Modest Edit Local Server...
echo =======================================================
node server.js
pause
