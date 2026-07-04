"""
Скрипт для заполнения таблицы activities.
Запуск: python ingest_activities.py [--skip-github]

Источники:
  - CURATED_ACTIVITIES — проверенный вручную список (как seed.py для universities).
  - GITHUB_SOURCES — реальный открытый список для школьников
    (JustinChavez/Pre-College-Opportunities). Не обновлялся с 2018 года,
    даты в нём без указания года — такие записи вставляются с verified=False
    и deadline=NULL, и не должны показываться студентам без ручной проверки
    (см. verified_only=True по умолчанию в GET /activities).
"""
import argparse
import os
import re
import sys

sys.path.insert(0, os.path.dirname(__file__))

import httpx

from app.database import supabase

CURATED_ACTIVITIES = [
    # ===== Стажировки =====
    {
        "title": "Google STEP Internship",
        "org": "Google",
        "category": "internship",
        "country": "США / Европа",
        "format": "Гибрид",
        "cost": "stipend",
        "cost_label": "Оплачиваемая",
        "grades": [11, 12],
        "level": "Продвинутый",
        "deadline": "2026-02-01",
        "duration": "12 недель, лето",
        "tags": ["CS", "Software Engineering", "Big Tech"],
        "prestige": 5,
        "about": "Программа Google для первокурсников и продвинутых старшеклассников. Реальные проекты с инженерными менторами, оплата + переезд.",
        "link": "https://buildyourfuture.withgoogle.com/programs/step/",
    },
    {
        "title": "Jane Street AMP",
        "org": "Jane Street",
        "category": "internship",
        "country": "Великобритания / США",
        "format": "Офлайн",
        "cost": "stipend",
        "cost_label": "Оплачиваемая",
        "grades": [11, 12],
        "level": "Продвинутый",
        "deadline": "2026-01-15",
        "duration": "5 недель, лето",
        "tags": ["Quant", "Finance", "Math", "CS"],
        "prestige": 5,
        "about": "Academy of Math and Programming — программа от ведущего quant-фонда. Идеально для тех, кто рассматривает количественные финансы.",
        "link": "https://www.janestreet.com/amp/",
    },
    {
        "title": "Школа анализа данных, Yandex",
        "org": "Yandex",
        "category": "internship",
        "country": "Казахстан / Онлайн",
        "format": "Гибрид",
        "cost": "free",
        "cost_label": "Бесплатно",
        "grades": [11, 12],
        "level": "Средний",
        "deadline": "2026-03-10",
        "duration": "8 недель",
        "tags": ["ML", "Data Science", "CS"],
        "prestige": 4,
        "about": "Интенсив по машинному обучению с лекциями инженеров Yandex и проектной работой. Сертификат + возможность стажировки.",
    },
    {
        "title": "Nazarbayev University CS Lab Intern",
        "org": "NU School of Engineering",
        "category": "internship",
        "country": "Казахстан",
        "format": "Офлайн",
        "cost": "free",
        "cost_label": "Бесплатно",
        "grades": [10, 11, 12],
        "level": "Средний",
        "deadline": "2026-04-20",
        "duration": "Лето, 6–10 недель",
        "tags": ["CS", "Research", "Local"],
        "prestige": 3,
        "about": "Стажировка в лабораториях NU. Подходит для усиления research-профиля в Казахстане до выпуска.",
    },
    # ===== Исследования =====
    {
        "title": "MIT PRIMES-USA",
        "org": "Massachusetts Institute of Technology",
        "category": "research",
        "country": "США / Удалённо",
        "format": "Онлайн",
        "cost": "free",
        "cost_label": "Бесплатно",
        "grades": [10, 11],
        "level": "Продвинутый",
        "deadline": "2025-11-30",
        "duration": "1 год, удалённо",
        "tags": ["Math", "CS", "Research", "Top-tier"],
        "prestige": 5,
        "about": "Годовая программа исследований по математике и CS под менторством PhD из MIT. Один из самых сильных research-проектов для школьников.",
        "link": "https://math.mit.edu/research/highschool/primes/usa.html",
    },
    {
        "title": "Research Science Institute (RSI)",
        "org": "CEE × MIT",
        "category": "research",
        "country": "США",
        "format": "Офлайн",
        "cost": "free",
        "cost_label": "Полностью покрыто",
        "grades": [11],
        "level": "Продвинутый",
        "deadline": "2026-01-12",
        "duration": "6 недель, лето",
        "tags": ["STEM", "Research", "Top-tier"],
        "prestige": 5,
        "about": "Самая престижная летняя research-программа в мире для школьников. Принимают ~80 человек глобально, полная стипендия.",
        "link": "https://www.cee.org/programs/research-science-institute",
    },
    {
        "title": "Pioneer Research Program",
        "org": "Pioneer Academics",
        "category": "research",
        "country": "Онлайн",
        "format": "Онлайн",
        "cost": "paid",
        "cost_label": "$6 500 (есть финпомощь)",
        "grades": [10, 11, 12],
        "level": "Средний",
        "deadline": "2026-02-28",
        "duration": "4 месяца",
        "tags": ["Research", "1-on-1", "Любая дисциплина"],
        "prestige": 4,
        "about": "Индивидуальный research-проект с профессором американского университета. Можно выбрать тему: AI, экономика, биология и др.",
        "link": "https://www.pioneeracademics.com/",
    },
    {
        "title": "Polygence Core",
        "org": "Polygence",
        "category": "research",
        "country": "Онлайн",
        "format": "Онлайн",
        "cost": "paid",
        "cost_label": "$2 500 (есть scholarships)",
        "grades": [9, 10, 11, 12],
        "level": "Начальный",
        "deadline": "2026-05-15",
        "duration": "10 встреч / 3 мес",
        "tags": ["Research", "Mentorship", "Любая тема"],
        "prestige": 3,
        "about": "Подбирают ментора-PhD под твою тему и за 3 месяца помогают довести research-проект до публикации или продукта.",
        "link": "https://www.polygence.org/",
    },
    # ===== Олимпиады =====
    # Даты не указываем: национальные отборочные туры назначает Минобр/оргкомитет
    # каждый год заново — фиксированная дата здесь была бы недостоверной.
    {
        "title": "International Olympiad in Informatics (IOI) — национальный отбор",
        "org": "IOI / Республиканская олимпиада по информатике",
        "category": "olympiad",
        "country": "Казахстан → международный этап",
        "format": "Офлайн",
        "cost": "free",
        "cost_label": "Бесплатно",
        "grades": [9, 10, 11, 12],
        "level": "Продвинутый",
        "deadline": None,
        "duration": "Отбор — учебный год, финал IOI — июль",
        "tags": ["CS", "Algorithms", "Olympiad", "Top-tier"],
        "prestige": 5,
        "about": "Путь на IOI идёт через республиканскую олимпиаду по информатике. Точные даты отборочных туров ежегодно устанавливает МОН РК — уточняй на сайте олимпиады.",
    },
    {
        "title": "International Mathematical Olympiad (IMO) — национальный отбор",
        "org": "IMO / Республиканская олимпиада по математике",
        "category": "olympiad",
        "country": "Казахстан → международный этап",
        "format": "Офлайн",
        "cost": "free",
        "cost_label": "Бесплатно",
        "grades": [9, 10, 11, 12],
        "level": "Продвинутый",
        "deadline": None,
        "duration": "Отбор — учебный год, финал IMO — июль",
        "tags": ["Math", "Olympiad", "Top-tier"],
        "prestige": 5,
        "about": "Классический сильный сигнал для топовых вузов по математике/CS. Отбор идёт через республиканскую олимпиаду, даты туров меняются год от года.",
    },
    {
        "title": "Conrad Challenge",
        "org": "Conrad Foundation",
        "category": "olympiad",
        "country": "Международный / Онлайн",
        "format": "Онлайн",
        "cost": "free",
        "cost_label": "Бесплатно",
        "grades": [9, 10, 11, 12],
        "level": "Средний",
        "deadline": None,
        "duration": "~5 месяцев, командный проект",
        "tags": ["Innovation", "STEM", "Entrepreneurship"],
        "prestige": 3,
        "about": "Командное соревнование инновационных STEM/бизнес-проектов с финалом на территории Kennedy Space Center. Даты сезона публикуются на сайте фонда каждый год.",
        "link": "https://www.conradchallenge.org/",
    },
    # ===== Волонтёрство =====
    {
        "title": "Habitat for Humanity — Global Village Youth Programs",
        "org": "Habitat for Humanity",
        "category": "volunteer",
        "country": "Международный",
        "format": "Офлайн",
        "cost": "paid",
        "cost_label": "Платно (взнос за поездку)",
        "grades": [10, 11, 12],
        "level": "Начальный",
        "deadline": None,
        "duration": "1–2 недели, выездная программа",
        "tags": ["Volunteering", "Community", "International"],
        "prestige": 3,
        "about": "Международные волонтёрские выезды на строительство жилья для нуждающихся семей. Приём заявок круглый год (rolling), даты поездок фиксированные.",
        "link": "https://www.habitat.org/volunteer/global-village",
    },
    {
        "title": "Key Club International",
        "org": "Kiwanis International",
        "category": "volunteer",
        "country": "Международный",
        "format": "Гибрид",
        "cost": "free",
        "cost_label": "Бесплатно",
        "grades": [9, 10, 11, 12],
        "level": "Начальный",
        "deadline": None,
        "duration": "Весь учебный год",
        "tags": ["Volunteering", "Leadership", "Community Service"],
        "prestige": 2,
        "about": "Крупнейшая школьная волонтёрская организация в мире — свой локальный клуб можно открыть при школе. Приём непрерывный (rolling).",
        "link": "https://www.keyclub.org/",
    },
]

GITHUB_SOURCES = [
    {
        "name": "JustinChavez/Pre-College-Opportunities",
        "url": "https://raw.githubusercontent.com/JustinChavez/Pre-College-Opportunities/master/README.md",
    },
]


def parse_github_markdown_table(text: str, source_name: str) -> list[dict]:
    """Парсит таблицу `| Opportunity | Grades | Time | Location | App Deadline | Cost | Notes |`."""
    rows = []
    for line in text.splitlines():
        line = line.strip()
        if not line.startswith("|"):
            continue
        cells = [c.strip() for c in line.strip("|").split("|")]
        if len(cells) < 5:
            continue
        first = cells[0]
        if first.lower() == "opportunity" or set(first) <= {"-", " ", ":"}:
            continue  # заголовок или строка-разделитель

        m = re.match(r"\[(.*?)\]\((.*?)\)", first)
        title = (m.group(1) if m else first).strip()
        link = m.group(2) if m else None
        if not title:
            continue

        grades_raw = cells[1] if len(cells) > 1 else ""
        grades = sorted({int(n) for n in re.findall(r"\b(9|10|11|12)\b", grades_raw)})
        cost_raw = cells[5] if len(cells) > 5 else ""

        rows.append({
            "title": title,
            "category": "research",  # источник смешивает research/STEM-программы, безопасный дефолт
            "country": cells[3] if len(cells) > 3 else None,
            "format": "Офлайн",
            "cost": "free" if "free" in cost_raw.lower() else "paid",
            "cost_label": cost_raw or None,
            "grades": grades or [9, 10, 11, 12],
            "deadline": None,  # в источнике даты без года — недостоверно, заполнять вручную
            "duration": cells[2] if len(cells) > 2 else None,
            "tags": ["STEM", "Summer Program"],
            "prestige": 2,
            "about": cells[6] if len(cells) > 6 else "",
            "link": link,
            "source": f"github:{source_name}",
            "verified": False,
        })
    return rows


def fetch_github_source(src: dict) -> list[dict]:
    resp = httpx.get(src["url"], timeout=15, follow_redirects=True)
    resp.raise_for_status()
    return parse_github_markdown_table(resp.text, src["name"])


def upsert(rows: list[dict]) -> tuple[int, int]:
    inserted = skipped = 0
    for row in rows:
        row.setdefault("source", "curated")
        row.setdefault("verified", True)
        payload = {k: v for k, v in row.items() if v is not None}
        existing = (
            supabase.table("activities")
            .select("id")
            .eq("title", row["title"])
            .eq("source", row["source"])
            .execute()
        )
        if existing.data:
            print(f"  SKIP  {row['title']} (уже есть)")
            skipped += 1
            continue
        try:
            supabase.table("activities").insert(payload).execute()
            tag = "" if row["verified"] else "  [unverified]"
            print(f"  OK    {row['title']} ({row['source']}){tag}")
            inserted += 1
        except Exception as e:
            print(f"  ERR   {row['title']}: {e}")
    return inserted, skipped


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--skip-github", action="store_true",
        help="Только curated-список, без запроса к внешним источникам",
    )
    args = parser.parse_args()

    print(f"Заполняем базу: {len(CURATED_ACTIVITIES)} проверенных активностей...")
    inserted, skipped = upsert(CURATED_ACTIVITIES)
    print(f"Curated: вставлено {inserted}, пропущено {skipped}")

    if not args.skip_github:
        for src in GITHUB_SOURCES:
            print(f"\nТянем из {src['name']} (verified=False — требует ручной проверки дедлайнов)...")
            try:
                rows = fetch_github_source(src)
            except Exception as e:
                print(f"  Не удалось получить {src['name']}: {e}")
                continue
            print(f"  Распарсено {len(rows)} записей")
            inserted, skipped = upsert(rows)
            print(f"  Вставлено {inserted}, пропущено {skipped}")


if __name__ == "__main__":
    main()
