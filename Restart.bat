@echo off
REM Очистка кэша Next.js и запуск dev-сервера

cd /d %~dp0
echo ==============================
echo 🧹 Удаляем папку .next ...
echo ==============================

rmdir /s /q .next

echo ==============================
echo 🚀 Запускаем Next.js (npm run dev)...
echo ==============================

npm run dev

pause
