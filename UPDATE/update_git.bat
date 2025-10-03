@echo off
cd /d "E:\ЗАКАЗЧИКИ\Инфографика\spirtuozogram"

echo ==========================================
echo   Обновляем проект spirtuozogram в GitHub
echo ==========================================

:: проверим подключение к GitHub
git remote -v
if %errorlevel% neq 0 (
    echo Ошибка: Git не найден или папка не является репозиторием.
    pause
    exit /b
)

:: подтянем последние изменения
git pull origin main --rebase

:: добавим все изменения
git add .

:: создадим коммит с текущей датой и временем
for /f "tokens=1-4 delims=. " %%i in ("%date%") do set DATE=%%i-%%j-%%k
for /f "tokens=1-2 delims=: " %%i in ("%time%") do set TIME=%%i-%%j
git commit -m "Автообновление: %DATE%_%TIME%"

:: отправим на GitHub
git push origin main

echo ==========================================
echo   ✅ Проект успешно обновлён в GitHub!
echo ==========================================
pause
