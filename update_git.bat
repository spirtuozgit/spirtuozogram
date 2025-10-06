@echo off
title Git Auto Update - Spirtuozogram
cd /d "%~dp0"

echo === Updating repository ===
git add -A
git commit -m "auto update"
git pull --rebase
git push

echo.
echo ✅ Update complete.
timeout /t 2 >nul
