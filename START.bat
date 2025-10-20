@echo off
chcp 65001 >nul
title Spirtuozogram Manager
color 0A

echo ===========================================
echo     🌀  SPIRTUOZOGRAM MANAGER START
echo ===========================================
echo.

:: Проверяем наличие Python и файла менеджера
set "PYTHON_EXE=python"
set "SCRIPT_NAME=git_server_manager.py"

if not exist "%SCRIPT_NAME%" (
    echo ❌ Ошибка: не найден %SCRIPT_NAME%
    pause
    exit /b
)

where %PYTHON_EXE% >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python не найден. Добавьте его в PATH или установите.
    pause
    exit /b
)

:: Запускаем менеджер в отдельном процессе и сразу закрываем окно
echo 🚀 Запуск менеджера Spirtuozogram...
start "" /min "%PYTHON_EXE%" "%SCRIPT_NAME%"
exit
