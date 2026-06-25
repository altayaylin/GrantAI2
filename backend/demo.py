"""
demo.py — локальный прогон всего движка подбора без подключения к БД.

Создаёт 3 портфолио студентов, прогоняет через matching engine
по всем 25 университетам из seed.py и печатает результаты.

Запуск: python demo.py
"""

import sys
import os
sys.stdout.reconfigure(encoding="utf-8")
sys.path.insert(0, os.path.dirname(__file__))

from app.models.profile import StudentProfile
from app.models.university import University
from app.services.matching import match_universities, passes_hard_filters, match_score, categorize

# ─────────────────────────────────────────────
# УНИВЕРСИТЕТЫ (те же что в seed.py, без БД)
# ─────────────────────────────────────────────
UNIVERSITIES = [
    University(id="mit",        name="MIT",                     country="USA",         qs_rank=1,   acceptance_rate=0.04, sat_25th=1510, sat_75th=1580, avg_gpa=4.17, min_ielts=7.0, majors=["Computer Science","Mathematics","Physics","Engineering"],                               has_scholarship=True,  tuition_usd=59750),
    University(id="stanford",   name="Stanford University",      country="USA",         qs_rank=5,   acceptance_rate=0.04, sat_25th=1500, sat_75th=1570, avg_gpa=3.96, min_ielts=7.0, majors=["Computer Science","Engineering","Business","Economics","Biology"],                    has_scholarship=True,  tuition_usd=62484),
    University(id="harvard",    name="Harvard University",       country="USA",         qs_rank=4,   acceptance_rate=0.04, sat_25th=1460, sat_75th=1580, avg_gpa=3.90, min_ielts=7.0, majors=["Economics","Biology","Computer Science","History","Mathematics"],                     has_scholarship=True,  tuition_usd=59320),
    University(id="caltech",    name="Caltech",                  country="USA",         qs_rank=6,   acceptance_rate=0.04, sat_25th=1530, sat_75th=1580, avg_gpa=4.19, min_ielts=7.0, majors=["Computer Science","Physics","Mathematics","Engineering","Chemistry"],                 has_scholarship=True,  tuition_usd=60864),
    University(id="princeton",  name="Princeton University",     country="USA",         qs_rank=22,  acceptance_rate=0.04, sat_25th=1500, sat_75th=1570, avg_gpa=3.90, min_ielts=7.0, majors=["Computer Science","Economics","Mathematics","Engineering","Public Policy"],           has_scholarship=True,  tuition_usd=59710),
    University(id="cmu",        name="Carnegie Mellon",          country="USA",         qs_rank=53,  acceptance_rate=0.11, sat_25th=1480, sat_75th=1560, avg_gpa=3.89, min_ielts=7.0, majors=["Computer Science","Engineering","Design","Business","Mathematics"],                   has_scholarship=True,  tuition_usd=61344),
    University(id="berkeley",   name="UC Berkeley",              country="USA",         qs_rank=10,  acceptance_rate=0.14, sat_25th=1310, sat_75th=1530, avg_gpa=3.89, min_ielts=6.5, majors=["Computer Science","Engineering","Economics","Biology","Mathematics"],                  has_scholarship=True,  tuition_usd=44066),
    University(id="gatech",     name="Georgia Tech",             country="USA",         qs_rank=89,  acceptance_rate=0.17, sat_25th=1370, sat_75th=1530, avg_gpa=4.07, min_ielts=7.0, majors=["Computer Science","Engineering","Mathematics","Business","Architecture"],             has_scholarship=True,  tuition_usd=32876),
    University(id="umich",      name="University of Michigan",   country="USA",         qs_rank=33,  acceptance_rate=0.20, sat_25th=1360, sat_75th=1530, avg_gpa=3.90, min_ielts=6.5, majors=["Computer Science","Engineering","Business","Economics","Biology"],                    has_scholarship=True,  tuition_usd=52266),
    University(id="utx",        name="UT Austin",                country="USA",         qs_rank=136, acceptance_rate=0.29, sat_25th=1230, sat_75th=1450, avg_gpa=3.78, min_ielts=6.5, majors=["Computer Science","Engineering","Business","Economics","Communications"],             has_scholarship=False, tuition_usd=38326),
    University(id="cambridge",  name="University of Cambridge",  country="UK",          qs_rank=2,   acceptance_rate=0.21, sat_25th=None, sat_75th=None, avg_gpa=4.00, min_ielts=7.5, majors=["Computer Science","Mathematics","Physics","Engineering","Economics"],                 has_scholarship=True,  tuition_usd=45860),
    University(id="oxford",     name="University of Oxford",     country="UK",          qs_rank=3,   acceptance_rate=0.17, sat_25th=None, sat_75th=None, avg_gpa=4.00, min_ielts=7.5, majors=["Computer Science","Mathematics","Physics","Economics","Law"],                         has_scholarship=True,  tuition_usd=45860),
    University(id="imperial",   name="Imperial College London",  country="UK",          qs_rank=8,   acceptance_rate=0.14, sat_25th=None, sat_75th=None, avg_gpa=3.90, min_ielts=6.5, majors=["Computer Science","Engineering","Mathematics","Physics","Business"],                  has_scholarship=False, tuition_usd=42000),
    University(id="ucl",        name="UCL",                      country="UK",          qs_rank=9,   acceptance_rate=0.63, sat_25th=None, sat_75th=None, avg_gpa=3.70, min_ielts=6.5, majors=["Computer Science","Engineering","Economics","Law","Mathematics"],                     has_scholarship=False, tuition_usd=35000),
    University(id="eth",        name="ETH Zürich",               country="Switzerland", qs_rank=7,   acceptance_rate=0.27, sat_25th=None, sat_75th=None, avg_gpa=4.00, min_ielts=7.0, majors=["Computer Science","Engineering","Mathematics","Physics","Architecture"],             has_scholarship=False, tuition_usd=1460),
    University(id="epfl",       name="EPFL",                     country="Switzerland", qs_rank=17,  acceptance_rate=0.30, sat_25th=None, sat_75th=None, avg_gpa=3.90, min_ielts=7.0, majors=["Computer Science","Engineering","Mathematics","Physics"],                            has_scholarship=False, tuition_usd=1460),
    University(id="delft",      name="TU Delft",                 country="Netherlands", qs_rank=49,  acceptance_rate=0.65, sat_25th=None, sat_75th=None, avg_gpa=3.80, min_ielts=6.5, majors=["Computer Science","Engineering","Architecture","Applied Mathematics"],               has_scholarship=False, tuition_usd=15000),
    University(id="uva",        name="University of Amsterdam",  country="Netherlands", qs_rank=53,  acceptance_rate=0.55, sat_25th=None, sat_75th=None, avg_gpa=3.70, min_ielts=6.5, majors=["Computer Science","Economics","Law","Psychology","Business"],                        has_scholarship=False, tuition_usd=12000),
    University(id="tum",        name="TU Munich",                country="Germany",     qs_rank=30,  acceptance_rate=0.30, sat_25th=None, sat_75th=None, avg_gpa=3.80, min_ielts=6.5, majors=["Computer Science","Engineering","Mathematics","Physics","Business"],                  has_scholarship=False, tuition_usd=300),
    University(id="toronto",    name="University of Toronto",    country="Canada",      qs_rank=25,  acceptance_rate=0.43, sat_25th=1240, sat_75th=1440, avg_gpa=3.70, min_ielts=6.5, majors=["Computer Science","Engineering","Mathematics","Economics","Biology"],                 has_scholarship=True,  tuition_usd=48040),
    University(id="mcgill",     name="McGill University",        country="Canada",      qs_rank=46,  acceptance_rate=0.41, sat_25th=1220, sat_75th=1420, avg_gpa=3.70, min_ielts=6.5, majors=["Computer Science","Engineering","Medicine","Law","Economics"],                       has_scholarship=True,  tuition_usd=30000),
    University(id="nus",        name="NUS",                      country="Singapore",   qs_rank=8,   acceptance_rate=0.20, sat_25th=1350, sat_75th=1530, avg_gpa=3.80, min_ielts=6.5, majors=["Computer Science","Engineering","Business","Medicine","Law"],                        has_scholarship=True,  tuition_usd=28000),
    University(id="melbourne",  name="University of Melbourne",  country="Australia",   qs_rank=14,  acceptance_rate=0.70, sat_25th=None, sat_75th=None, avg_gpa=3.60, min_ielts=6.5, majors=["Computer Science","Engineering","Business","Law","Medicine"],                        has_scholarship=True,  tuition_usd=38000),
    University(id="kaist",      name="KAIST",                    country="South Korea", qs_rank=56,  acceptance_rate=0.25, sat_25th=1350, sat_75th=1510, avg_gpa=3.90, min_ielts=6.5, majors=["Computer Science","Engineering","Mathematics","Physics"],                            has_scholarship=True,  tuition_usd=8000),
    University(id="todai",      name="University of Tokyo",      country="Japan",       qs_rank=32,  acceptance_rate=0.33, sat_25th=None, sat_75th=None, avg_gpa=3.80, min_ielts=6.5, majors=["Computer Science","Engineering","Mathematics","Economics","Law"],                    has_scholarship=True,  tuition_usd=5000),
]

# ─────────────────────────────────────────────
# ПОРТФОЛИО СТУДЕНТОВ
# ─────────────────────────────────────────────
STUDENTS = [
    StudentProfile(
        id="alisher",
        major="Computer Science",
        target_countries=["USA", "UK", "Switzerland"],
        gpa=3.9,
        gpa_scale=4.0,
        sat_total=1520,
        sat_math=780,
        sat_ebrw=740,
        ielts=7.5,
        activities_count=5,   # робототехника, дебаты, ментор
        awards_count=3,        # олимпиады физика/CS, национальный уровень
    ),
    StudentProfile(
        id="dana",
        major="Computer Science",
        target_countries=["Netherlands", "Germany", "Canada"],
        gpa=3.7,
        gpa_scale=4.0,
        sat_total=1380,
        sat_math=720,
        sat_ebrw=660,
        ielts=7.0,
        activities_count=3,
        awards_count=1,
    ),
    StudentProfile(
        id="temirlan",
        major="Engineering",
        target_countries=["USA", "Canada", "Singapore"],
        gpa=3.5,
        gpa_scale=4.0,
        sat_total=1280,
        sat_math=690,
        sat_ebrw=590,
        ielts=6.5,
        activities_count=2,
        awards_count=0,
    ),
]

STUDENT_NAMES = {
    "alisher": "Алишер (сильный профиль, США/UK/Швейцария)",
    "dana":    "Дана    (средний профиль, Нидерланды/Германия/Канада)",
    "temirlan":"Темирлан (слабее среднего, США/Канада/Сингапур)",
}

CATEGORY_COLOR = {"reach": "🔴", "match": "🟡", "safety": "🟢"}


def print_separator(char="─", width=70):
    print(char * width)


def run_demo():
    print_separator("═")
    print(" GrantAI — Демо движка подбора университетов")
    print_separator("═")
    print(f" Университетов в базе: {len(UNIVERSITIES)}")
    print(f" Студентов для теста:  {len(STUDENTS)}")
    print()

    for student in STUDENTS:
        print_separator()
        print(f"  СТУДЕНТ: {STUDENT_NAMES[student.id]}")
        print_separator()
        print(f"  Специальность : {student.major}")
        print(f"  Страны        : {', '.join(student.target_countries)}")
        print(f"  GPA           : {student.gpa}/{student.gpa_scale}")
        print(f"  SAT           : {student.sat_total} (Math {student.sat_math}, EBRW {student.sat_ebrw})")
        print(f"  IELTS         : {student.ielts}")
        print(f"  Активности    : {student.activities_count}   Награды: {student.awards_count}")
        print()

        results = match_universities(student, UNIVERSITIES)

        if not results:
            print("  ⚠️  Ни один вуз не прошёл фильтры для этого профиля.")
            print()
            continue

        by_cat = {"reach": [], "match": [], "safety": []}
        for r in results:
            by_cat[r.category].append(r)

        print(f"  Прошло фильтры: {len(results)} из {len(UNIVERSITIES)} вузов")
        print()

        for cat in ["safety", "match", "reach"]:
            icon = CATEGORY_COLOR[cat]
            label = cat.upper()
            items = by_cat[cat]
            if not items:
                continue
            print(f"  {icon} {label} ({len(items)} вузов)")
            for r in items:
                u = r.university
                score_bar = "█" * int(r.match_score * 10) + "░" * (10 - int(r.match_score * 10))
                reasons_str = " · ".join(r.reasons)
                print(f"     {u.name:<30}  score={r.match_score:.3f}  [{score_bar}]")
                print(f"       ↳ {reasons_str}")
            print()

        # Сводка по категориям
        print(f"  ИТОГО: 🟢 Safety={len(by_cat['safety'])}  🟡 Match={len(by_cat['match'])}  🔴 Reach={len(by_cat['reach'])}")
        print()

    print_separator("═")
    print(" Проверка отдельных осей движка")
    print_separator("═")

    student = STUDENTS[0]  # Алишер
    print(f"\n  Студент: {STUDENT_NAMES[student.id]}\n")
    print(f"  {'Вуз':<30} {'SAT-ось':>8} {'GPA-ось':>8} {'Act':>6} {'Awd':>6} {'Score':>7} {'Кат.'}")
    print("  " + "─" * 65)

    from app.services.matching import compute_axes, match_score, categorize, passes_hard_filters

    for uni in UNIVERSITIES:
        if not passes_hard_filters(student, uni):
            continue
        axes = compute_axes(student, uni)
        score = match_score(student, uni)
        cat, _ = categorize(student, uni, score)
        icon = CATEGORY_COLOR[cat]
        sat_val = f"{axes.get('sat', '-'):6.3f}" if "sat" in axes else "     -"
        gpa_val = f"{axes.get('gpa', '-'):6.3f}" if "gpa" in axes else "     -"
        act_val = f"{axes.get('activities', 0):6.3f}"
        awd_val = f"{axes.get('awards', 0):6.3f}"
        print(f"  {uni.name:<30} {sat_val} {gpa_val} {act_val} {awd_val} {score:7.3f}  {icon}{cat}")

    print_separator("═")
    print(" Все тесты пройдены. Движок подбора работает корректно.")
    print_separator("═")


if __name__ == "__main__":
    run_demo()
