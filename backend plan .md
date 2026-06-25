# GrantAI — План настройки бэкенда (FastAPI + Supabase)

Пошаговый план для реализации бэкенда GrantAI с фокусом на функцию подбора университетов под профиль студента.

**Стек:** Python · FastAPI · Supabase (PostgreSQL) · Pydantic

---

## Содержание

1. [Архитектура — общая картина](#1-архитектура)
2. [Настройка Supabase](#2-настройка-supabase)
3. [Схема базы данных](#3-схема-базы-данных)
4. [Настройка проекта FastAPI](#4-настройка-проекта-fastapi)
5. [Подключение к Supabase](#5-подключение-к-supabase)
6. [Модели данных (Pydantic)](#6-модели-данных-pydantic)
7. [Движок подбора университетов](#7-движок-подбора-университетов)
8. [API эндпоинты](#8-api-эндпоинты)
9. [Заполнение базы университетов](#9-заполнение-базы-университетов)
10. [Авторизация](#10-авторизация)
11. [Чеклист запуска](#11-чеклист-запуска)

---

## 1. Архитектура

```
Frontend (Next.js)
      │
      │ HTTP (REST)
      ▼
FastAPI ──────────► Supabase (PostgreSQL)
      │                    │
      │                    ├── profiles
      │                    ├── universities
      │                    ├── student_university_list
      │                    └── deadlines
      │
      └── Movok подбора (matching engine, чистый Python)
```

**Принцип разделения:**
- Supabase хранит данные и отвечает за авторизацию.
- FastAPI содержит бизнес-логику (подбор, scoring, категоризация).
- Движок подбора — это чистые Python-функции без обращения к БД (легко тестировать).

---

## 2. Настройка Supabase

### Шаг 2.1 — Создать проект
1. Зайти на [supabase.com](https://supabase.com), создать аккаунт.
2. New Project → выбрать имя `grantai`, задать пароль для БД (сохранить!).
3. Выбрать регион поближе (Frankfurt для Казахстана — оптимально по задержке).
4. Дождаться готовности проекта (~2 минуты).

### Шаг 2.2 — Получить ключи
В Project Settings → API скопировать и сохранить:
- `Project URL` (вид `https://xxxxx.supabase.co`)
- `anon public` ключ (для клиентских запросов)
- `service_role` ключ (для серверных запросов из FastAPI — **держать в секрете**)

> ⚠️ `service_role` ключ обходит Row Level Security. Использовать только на бэкенде, никогда не отдавать на фронт.

---

## 3. Схема базы данных

Выполнить в Supabase → SQL Editor.

### Таблица `profiles`
Профиль студента. Связана с таблицей авторизации Supabase (`auth.users`).

```sql
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  school text,
  grade int,
  city text,
  major text,                          -- например 'Computer Science'
  target_countries text[],             -- например '{USA, Switzerland}'
  gpa numeric(3,2),                    -- по шкале 4.0 (или храни как есть + поле gpa_scale)
  gpa_scale numeric(3,2) default 4.0,
  sat_total int,
  sat_math int,
  sat_ebrw int,
  ielts numeric(2,1),
  toefl int,
  activities_count int default 0,
  awards_count int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### Таблица `universities`
Справочник вузов с требованиями. Это ядро подбора.

```sql
create table universities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  country text not null,
  qs_rank int,
  acceptance_rate numeric(4,3),        -- 0.04 = 4%
  -- диапазон поступивших (перцентили)
  sat_25th int,
  sat_75th int,
  avg_gpa numeric(3,2),
  min_ielts numeric(2,1),
  min_toefl int,
  majors text[],                       -- какие мейджоры есть
  deadline date,
  tuition_usd int,
  has_scholarship boolean default false,
  created_at timestamptz default now()
);

create index idx_uni_country on universities(country);
create index idx_uni_majors on universities using gin(majors);
```

### Таблица `student_university_list`
Какие вузы студент добавил в свой список. Связь many-to-many.

```sql
create table student_university_list (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references profiles(id) on delete cascade,
  university_id uuid references universities(id) on delete cascade,
  category text,                       -- 'safety' | 'match' | 'reach'
  match_score numeric(4,3),            -- сохранённый score на момент добавления
  added_at timestamptz default now(),
  unique(student_id, university_id)
);
```

### Таблица `deadlines`
Дедлайны — автозаполняются при добавлении вуза или активности.

```sql
create table deadlines (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references profiles(id) on delete cascade,
  title text not null,
  source_type text,                    -- 'university' | 'activity' | 'manual'
  source_id uuid,                      -- ссылка на university_id или activity_id
  due_date date not null,
  category text,                       -- 'Вуз' | 'Летняя программа' | 'Личное'
  completed boolean default false,
  created_at timestamptz default now()
);

create index idx_deadlines_student on deadlines(student_id);
```

---

## 4. Настройка проекта FastAPI

### Шаг 4.1 — Структура папок
```
grantai-backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # точка входа FastAPI
│   ├── config.py               # настройки, чтение .env
│   ├── database.py             # клиент Supabase
│   ├── models/
│   │   ├── __init__.py
│   │   ├── profile.py          # Pydantic модели профиля
│   │   └── university.py       # Pydantic модели вуза
│   ├── services/
│   │   ├── __init__.py
│   │   └── matching.py         # ДВИЖОК ПОДБОРА (главная логика)
│   └── routers/
│       ├── __init__.py
│       ├── profiles.py         # эндпоинты профиля
│       ├── universities.py     # эндпоинты вузов + подбор
│       └── deadlines.py        # эндпоинты дедлайнов
├── tests/
│   └── test_matching.py        # тесты движка подбора
├── .env                        # секреты (НЕ в git)
├── .gitignore
├── requirements.txt
└── README.md
```

### Шаг 4.2 — Виртуальное окружение и зависимости
```bash
# создать папку и виртуальное окружение
mkdir grantai-backend && cd grantai-backend
python -m venv venv

# активировать (Windows PowerShell)
.\venv\Scripts\Activate.ps1

# активировать (Mac/Linux)
source venv/bin/activate

# установить зависимости
pip install fastapi uvicorn supabase python-dotenv pydantic pydantic-settings pytest
pip freeze > requirements.txt
```

### Шаг 4.3 — Файл `.env`
```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=твой_service_role_ключ
```

### Шаг 4.4 — Файл `.gitignore`
```
venv/
.env
__pycache__/
*.pyc
.pytest_cache/
```

---

## 5. Подключение к Supabase

### `app/config.py`
```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    supabase_url: str
    supabase_service_key: str

    class Config:
        env_file = ".env"

settings = Settings()
```

### `app/database.py`
```python
from supabase import create_client, Client
from app.config import settings

supabase: Client = create_client(
    settings.supabase_url,
    settings.supabase_service_key
)
```

---

## 6. Модели данных (Pydantic)

### `app/models/profile.py`
```python
from pydantic import BaseModel
from typing import Optional

class StudentProfile(BaseModel):
    id: str
    major: str
    target_countries: list[str]
    gpa: float
    gpa_scale: float = 4.0
    sat_total: Optional[int] = None
    sat_math: Optional[int] = None
    sat_ebrw: Optional[int] = None
    ielts: Optional[float] = None
    toefl: Optional[int] = None
    activities_count: int = 0
    awards_count: int = 0
```

### `app/models/university.py`
```python
from pydantic import BaseModel
from typing import Optional
from datetime import date

class University(BaseModel):
    id: str
    name: str
    country: str
    qs_rank: Optional[int] = None
    acceptance_rate: Optional[float] = None
    sat_25th: Optional[int] = None
    sat_75th: Optional[int] = None
    avg_gpa: Optional[float] = None
    min_ielts: Optional[float] = None
    min_toefl: Optional[int] = None
    majors: list[str] = []
    deadline: Optional[date] = None
    has_scholarship: bool = False

class MatchResult(BaseModel):
    university: University
    match_score: float        # 0..1
    category: str             # 'safety' | 'match' | 'reach'
    reasons: list[str]        # объяснение: почему такая категория
```

---

## 7. Движок подбора университетов

Это сердце продукта. Чистые функции без обращения к БД — их легко тестировать.

### `app/services/matching.py`
```python
from app.models.profile import StudentProfile
from app.models.university import University, MatchResult


def clamp(value: float, low: float = 0.0, high: float = 1.0) -> float:
    return max(low, min(high, value))


def passes_hard_filters(student: StudentProfile, uni: University) -> bool:
    """Жёсткие фильтры: вуз вылетает, если не проходит базовые требования."""
    # страна должна быть в списке целевых (если студент указал)
    if student.target_countries and uni.country not in student.target_countries:
        return False
    # мейджор должен присутствовать в вузе
    if uni.majors and student.major not in uni.majors:
        return False
    # минимальный балл по языку
    if uni.min_ielts and student.ielts and student.ielts < uni.min_ielts:
        return False
    return True


def normalize_gpa(student: StudentProfile) -> float:
    """Приводим GPA к шкале 4.0 для честного сравнения."""
    return (student.gpa / student.gpa_scale) * 4.0


def compute_axes(student: StudentProfile, uni: University) -> dict:
    """Считаем совпадение по каждой оси (0..1)."""
    axes = {}

    # SAT: где студент относительно диапазона поступивших
    if student.sat_total and uni.sat_25th and uni.sat_75th:
        spread = uni.sat_75th - uni.sat_25th
        if spread > 0:
            axes["sat"] = clamp((student.sat_total - uni.sat_25th) / spread)
        else:
            axes["sat"] = 1.0 if student.sat_total >= uni.sat_25th else 0.0

    # GPA: отношение к среднему поступившему
    if uni.avg_gpa:
        student_gpa = normalize_gpa(student)
        axes["gpa"] = clamp(student_gpa / 4.0)  # нормализуем к 4.0

    # Активности и награды (простая нормализация)
    axes["activities"] = clamp(student.activities_count / 6.0)
    axes["awards"] = clamp(student.awards_count / 4.0)

    return axes


def match_score(student: StudentProfile, uni: University) -> float:
    """Взвешенная сумма по осям → итоговый score 0..1."""
    axes = compute_axes(student, uni)

    weights = {
        "sat": 0.35,
        "gpa": 0.35,
        "activities": 0.20,
        "awards": 0.10,
    }

    total_weight = 0.0
    score = 0.0
    for axis, weight in weights.items():
        if axis in axes:
            score += axes[axis] * weight
            total_weight += weight

    # нормализуем на случай, если какие-то оси отсутствуют
    return score / total_weight if total_weight > 0 else 0.0


def categorize(student: StudentProfile, uni: University, score: float) -> tuple[str, list[str]]:
    """
    Категория считается по тому, ГДЕ профиль стоит относительно
    диапазона поступивших — не как 'шанс', а как соответствие.
    """
    reasons = []

    # ключевой сигнал: положение SAT относительно перцентилей
    above_75 = (student.sat_total and uni.sat_75th
                and student.sat_total >= uni.sat_75th)
    below_25 = (student.sat_total and uni.sat_25th
                and student.sat_total < uni.sat_25th)

    # очень селективные вузы (acceptance < 10%) — всегда reach
    very_selective = uni.acceptance_rate and uni.acceptance_rate < 0.10

    if very_selective:
        category = "reach"
        reasons.append("Очень высокая селективность вуза")
    elif above_75 and score >= 0.75:
        category = "safety"
        reasons.append("Профиль сильнее типичного поступившего")
    elif below_25 or score < 0.45:
        category = "reach"
        reasons.append("Профиль ниже среднего поступившего")
    else:
        category = "match"
        reasons.append("Профиль в диапазоне поступивших")

    return category, reasons


def match_universities(
    student: StudentProfile,
    universities: list[University]
) -> list[MatchResult]:
    """Главная функция: прогоняет все вузы через подбор."""
    results = []

    for uni in universities:
        if not passes_hard_filters(student, uni):
            continue

        score = match_score(student, uni)
        category, reasons = categorize(student, uni, score)

        results.append(MatchResult(
            university=uni,
            match_score=round(score, 3),
            category=category,
            reasons=reasons,
        ))

    # сортируем по score по убыванию
    results.sort(key=lambda r: r.match_score, reverse=True)
    return results
```

---

## 8. API эндпоинты

### `app/routers/universities.py`
```python
from fastapi import APIRouter, HTTPException
from app.database import supabase
from app.models.profile import StudentProfile
from app.models.university import University, MatchResult
from app.services.matching import match_universities

router = APIRouter(prefix="/universities", tags=["universities"])


@router.get("/")
async def list_universities(country: str = None, major: str = None):
    """Список вузов с опциональной фильтрацией."""
    query = supabase.table("universities").select("*")
    if country:
        query = query.eq("country", country)
    response = query.execute()
    return response.data


@router.get("/match/{student_id}", response_model=list[MatchResult])
async def get_matches(student_id: str):
    """Подбор вузов под профиль студента."""
    # 1. загрузить профиль
    profile_res = (supabase.table("profiles")
                   .select("*").eq("id", student_id).single().execute())
    if not profile_res.data:
        raise HTTPException(404, "Профиль не найден")
    student = StudentProfile(**profile_res.data)

    # 2. загрузить все вузы (позже можно предфильтровать по стране в SQL)
    uni_res = supabase.table("universities").select("*").execute()
    universities = [University(**u) for u in uni_res.data]

    # 3. прогнать через движок подбора
    return match_universities(student, universities)


@router.post("/list/{student_id}/{university_id}")
async def add_to_list(student_id: str, university_id: str):
    """Добавить вуз в список студента + автосоздать дедлайн."""
    # получить вуз для дедлайна
    uni = (supabase.table("universities")
           .select("*").eq("id", university_id).single().execute()).data

    # добавить в список
    supabase.table("student_university_list").insert({
        "student_id": student_id,
        "university_id": university_id,
    }).execute()

    # АВТОСОЗДАНИЕ ДЕДЛАЙНА (ключевая связь между страницами)
    if uni.get("deadline"):
        supabase.table("deadlines").insert({
            "student_id": student_id,
            "title": f"Подача: {uni['name']}",
            "source_type": "university",
            "source_id": university_id,
            "due_date": uni["deadline"],
            "category": "Вуз",
        }).execute()

    return {"status": "added"}
```

### `app/main.py`
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import universities, profiles, deadlines

app = FastAPI(title="GrantAI API")

# CORS — разрешить запросы с фронтенда
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # домен фронта
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(universities.router)
app.include_router(profiles.router)
app.include_router(deadlines.router)

@app.get("/")
def root():
    return {"status": "GrantAI API работает"}
```

### Запуск сервера
```bash
uvicorn app.main:app --reload
```
Открыть `http://localhost:8000/docs` — автоматическая документация Swagger со всеми эндпоинтами.

---

## 9. Заполнение базы университетов

> Совет: на старте НЕ парси сайты вузов. Заполни вручную 50–100 топовых вузов из публичных данных (Common Data Set, CollegeData, официальные сайты).

### Где брать данные по перцентилям
- `sat_25th`, `sat_75th` — Common Data Set вуза (раздел C9) или CollegeData.com
- `avg_gpa` — официальные admission-страницы
- `acceptance_rate` — официальная статистика
- `deadline` — admissions-страница вуза

### Пример: вставка через SQL
```sql
insert into universities
  (name, country, qs_rank, acceptance_rate, sat_25th, sat_75th,
   avg_gpa, min_ielts, majors, deadline, has_scholarship)
values
  ('MIT', 'USA', 1, 0.04, 1510, 1580, 4.17, 7.0,
   '{Computer Science, Mathematics, Physics}', '2027-01-01', true),
  ('ETH Zürich', 'Switzerland', 7, 0.27, 1450, 1550, 4.0, 7.0,
   '{Computer Science, Engineering}', '2026-12-15', false),
  ('TU Delft', 'Netherlands', 49, 0.65, 1380, 1480, 3.8, 6.5,
   '{Computer Science, Engineering}', '2027-01-15', false);
```

### Альтернатива: загрузка из CSV
Подготовь файл `universities.csv`, затем напиши скрипт `seed.py`:
```python
import csv
from app.database import supabase

with open("universities.csv") as f:
    reader = csv.DictReader(f)
    for row in reader:
        row["majors"] = row["majors"].split(";")  # 'CS;Math' → ['CS','Math']
        supabase.table("universities").insert(row).execute()

print("База вузов заполнена")
```

---

## 10. Авторизация

Supabase даёт авторизацию из коробки. Фронтенд логинит пользователя через Supabase Auth и получает JWT-токен. FastAPI проверяет этот токен.

### Проверка токена в FastAPI
```python
from fastapi import Depends, HTTPException, Header
from app.database import supabase

async def get_current_user(authorization: str = Header(...)):
    """Извлекает пользователя из JWT-токена Supabase."""
    token = authorization.replace("Bearer ", "")
    try:
        user = supabase.auth.get_user(token)
        return user.user.id
    except Exception:
        raise HTTPException(401, "Недействительный токен")
```

Затем защищаешь эндпоинты:
```python
@router.get("/match/me")
async def get_my_matches(user_id: str = Depends(get_current_user)):
    # user_id берётся из токена, не из URL — безопаснее
    ...
```

### Row Level Security (RLS)
Включи RLS в Supabase, чтобы студент видел только свои данные:
```sql
alter table profiles enable row level security;

create policy "Студенты видят свой профиль"
  on profiles for select
  using (auth.uid() = id);

create policy "Студенты редактируют свой профиль"
  on profiles for update
  using (auth.uid() = id);
```

> Таблица `universities` — публичная (читают все), RLS на неё не нужен для SELECT.

---

## 11. Чеклист запуска

### Минимальный рабочий бэкенд (MVP)
- [ ] Создан проект Supabase, сохранены ключи
- [ ] Выполнены SQL-миграции (4 таблицы)
- [ ] Настроен проект FastAPI, установлены зависимости
- [ ] Файл `.env` заполнен, добавлен в `.gitignore`
- [ ] Работает подключение к Supabase (`/` отдаёт статус)
- [ ] Написан движок подбора `matching.py`
- [ ] Эндпоинт `/universities/match/{student_id}` возвращает результат
- [ ] Заполнено 20–30 вузов для теста
- [ ] Swagger `/docs` открывается и эндпоинты работают

### Следующий этап
- [ ] Автосоздание дедлайнов при добавлении вуза
- [ ] Авторизация через Supabase JWT
- [ ] Включён RLS на пользовательских таблицах
- [ ] Тесты движка подбора (`pytest tests/`)
- [ ] Заполнено 50–100 вузов
- [ ] Деплой (Railway / Render / Fly.io)

### Важные принципы
1. **Движок подбора не лезет в БД** — это чистые функции, их легко тестировать и менять формулу весов.
2. **Категория объясняется** — каждый MatchResult несёт `reasons[]`, чтобы пользователь понимал, почему вуз попал в Reach/Match/Safety.
3. **Дедлайны автозаполняются** — при добавлении вуза в список сразу создаётся запись в `deadlines`. Это та самая «невидимая связь» между страницами.
4. **service_role ключ — только на бэкенде.** Никогда не отдавай его на фронт.

---

## Тестирование движка подбора

### `tests/test_matching.py`
```python
from app.models.profile import StudentProfile
from app.models.university import University
from app.services.matching import match_score, categorize, passes_hard_filters


def make_student():
    return StudentProfile(
        id="test", major="Computer Science",
        target_countries=["USA"], gpa=3.9, sat_total=1500,
        activities_count=4, awards_count=3,
    )

def make_mit():
    return University(
        id="mit", name="MIT", country="USA",
        acceptance_rate=0.04, sat_25th=1510, sat_75th=1580,
        avg_gpa=4.17, majors=["Computer Science"],
    )

def test_hard_filter_country():
    student = make_student()
    student.target_countries = ["Germany"]
    assert passes_hard_filters(student, make_mit()) is False

def test_very_selective_is_reach():
    student = make_student()
    uni = make_mit()
    score = match_score(student, uni)
    category, reasons = categorize(student, uni, score)
    assert category == "reach"  # MIT с 4% всегда reach
```

Запуск: `pytest tests/ -v`