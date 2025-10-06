@echo off
title Git Update with Double Confirmation
color 0A

echo ===========================================
echo     SPIRTUOZOGRAM - Git Update Script
echo ===========================================
echo.

set /p first="Вы уверены, что хотите обновить репозиторий? (Y/N): "
if /i not "%first%"=="Y" (
    echo Отмена операции.
    pause
    exit /b
)

echo.
set /p second="Подтвердите еще раз (введите Y для продолжения): "
if /i not "%second%"=="Y" (
    echo Операция отменена пользователем.
    pause
    exit /b
)

echo.
echo ✅ Подтверждено дважды! Выполняем обновление...
echo.

:: Твои команды (пример)
git add .
git commit -m "Автоматическое обновление"
git push origin main

echo.
echo 🎉 Репозиторий успешно обновлен!
pause
