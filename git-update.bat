@echo off
:: === Автоматическое обновление сайта через Git ===
:: Работает из папки проекта

echo.
echo 🚀 Обновление проекта и деплой на Netlify...
echo.

:: добавляем все изменения
git add .

:: создаём коммит с текущей датой/временем
set now=%date% %time%
git commit -m "Update: %now%"

:: пушим в основную ветку (обычно main)
git push origin main

echo.
echo ✅ Готово! Сайт обновляется на Netlify.
pause
