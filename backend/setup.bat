@echo off
echo ════════════════════════════════════════════
echo   Naviuni Backend — запуск
echo ════════════════════════════════════════════

:: Проверяем Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ОШИБКА] Python не найден!
    echo.
    echo Установи Python 3.12 — инсталлятор:
    echo   Рабочий стол\Etasa new\Ноутбук Lenovo Жасулан\Downloads\python-3.12.3-amd64.exe
    echo.
    echo При установке ОБЯЗАТЕЛЬНО поставь галочку "Add Python to PATH"
    pause
    exit /b 1
)

echo [OK] Python:
python --version

:: Устанавливаем зависимости глобально
echo [..] Устанавливаем зависимости...
pip install -r requirements.txt --quiet
echo [OK] Зависимости установлены

:: Проверяем .env
if not exist ".env" (
    echo.
    echo [!] Файл .env не найден!
    echo     Скопируй .env.example в .env и вставь service_role ключ:
    echo     Supabase -^> Project Settings -^> API -^> service_role
    echo.
    echo     Запускаем только demo.py (без БД)
    echo.
    python demo.py
    python -m pytest tests/ -v
    pause
    exit /b 0
)

:: Запускаем демо
echo.
echo ════════════════════════════════════════════
echo   demo.py — движок подбора (без БД)
echo ════════════════════════════════════════════
python demo.py

:: Запускаем тесты
echo.
echo ════════════════════════════════════════════
echo   pytest — юнит-тесты движка
echo ════════════════════════════════════════════
python -m pytest tests/ -v

:: Заполняем БД и запускаем сервер
echo.
echo ════════════════════════════════════════════
echo   seed.py — заполнение БД университетами
echo ════════════════════════════════════════════
python seed.py

echo.
echo ════════════════════════════════════════════
echo   FastAPI сервер: http://localhost:8000/docs
echo   Стоп: Ctrl+C
echo ════════════════════════════════════════════
python -m uvicorn app.main:app --reload

pause
