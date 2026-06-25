"""
Скрипт для начального заполнения таблицы universities.
Запуск: python seed.py
"""
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from app.database import supabase

UNIVERSITIES = [
    # USA
    {
        "name": "MIT",
        "country": "USA",
        "qs_rank": 1,
        "acceptance_rate": 0.04,
        "sat_25th": 1510,
        "sat_75th": 1580,
        "avg_gpa": 4.17,
        "min_ielts": 7.0,
        "majors": ["Computer Science", "Mathematics", "Physics", "Engineering"],
        "deadline": "2027-01-01",
        "has_scholarship": True,
        "tuition_usd": 59750,
    },
    {
        "name": "Stanford University",
        "country": "USA",
        "qs_rank": 5,
        "acceptance_rate": 0.04,
        "sat_25th": 1500,
        "sat_75th": 1570,
        "avg_gpa": 3.96,
        "min_ielts": 7.0,
        "majors": ["Computer Science", "Engineering", "Business", "Economics", "Biology"],
        "deadline": "2027-01-05",
        "has_scholarship": True,
        "tuition_usd": 62484,
    },
    {
        "name": "Harvard University",
        "country": "USA",
        "qs_rank": 4,
        "acceptance_rate": 0.04,
        "sat_25th": 1460,
        "sat_75th": 1580,
        "avg_gpa": 3.9,
        "min_ielts": 7.0,
        "majors": ["Economics", "Biology", "Computer Science", "History", "Mathematics"],
        "deadline": "2027-01-01",
        "has_scholarship": True,
        "tuition_usd": 59320,
    },
    {
        "name": "Caltech",
        "country": "USA",
        "qs_rank": 6,
        "acceptance_rate": 0.04,
        "sat_25th": 1530,
        "sat_75th": 1580,
        "avg_gpa": 4.19,
        "min_ielts": 7.0,
        "majors": ["Computer Science", "Physics", "Mathematics", "Engineering", "Chemistry"],
        "deadline": "2027-01-03",
        "has_scholarship": True,
        "tuition_usd": 60864,
    },
    {
        "name": "Princeton University",
        "country": "USA",
        "qs_rank": 22,
        "acceptance_rate": 0.04,
        "sat_25th": 1500,
        "sat_75th": 1570,
        "avg_gpa": 3.9,
        "min_ielts": 7.0,
        "majors": ["Computer Science", "Economics", "Mathematics", "Engineering", "Public Policy"],
        "deadline": "2027-01-01",
        "has_scholarship": True,
        "tuition_usd": 59710,
    },
    {
        "name": "Carnegie Mellon University",
        "country": "USA",
        "qs_rank": 53,
        "acceptance_rate": 0.11,
        "sat_25th": 1480,
        "sat_75th": 1560,
        "avg_gpa": 3.89,
        "min_ielts": 7.0,
        "majors": ["Computer Science", "Engineering", "Design", "Business", "Mathematics"],
        "deadline": "2027-01-03",
        "has_scholarship": True,
        "tuition_usd": 61344,
    },
    {
        "name": "UC Berkeley",
        "country": "USA",
        "qs_rank": 10,
        "acceptance_rate": 0.14,
        "sat_25th": 1310,
        "sat_75th": 1530,
        "avg_gpa": 3.89,
        "min_ielts": 6.5,
        "majors": ["Computer Science", "Engineering", "Economics", "Biology", "Mathematics"],
        "deadline": "2026-11-30",
        "has_scholarship": True,
        "tuition_usd": 44066,
    },
    {
        "name": "Georgia Tech",
        "country": "USA",
        "qs_rank": 89,
        "acceptance_rate": 0.17,
        "sat_25th": 1370,
        "sat_75th": 1530,
        "avg_gpa": 4.07,
        "min_ielts": 7.0,
        "majors": ["Computer Science", "Engineering", "Mathematics", "Business", "Architecture"],
        "deadline": "2027-01-06",
        "has_scholarship": True,
        "tuition_usd": 32876,
    },
    {
        "name": "University of Michigan",
        "country": "USA",
        "qs_rank": 33,
        "acceptance_rate": 0.20,
        "sat_25th": 1360,
        "sat_75th": 1530,
        "avg_gpa": 3.9,
        "min_ielts": 6.5,
        "majors": ["Computer Science", "Engineering", "Business", "Economics", "Biology"],
        "deadline": "2027-02-01",
        "has_scholarship": True,
        "tuition_usd": 52266,
    },
    {
        "name": "University of Texas at Austin",
        "country": "USA",
        "qs_rank": 136,
        "acceptance_rate": 0.29,
        "sat_25th": 1230,
        "sat_75th": 1450,
        "avg_gpa": 3.78,
        "min_ielts": 6.5,
        "majors": ["Computer Science", "Engineering", "Business", "Economics", "Communications"],
        "deadline": "2026-12-01",
        "has_scholarship": False,
        "tuition_usd": 38326,
    },
    # UK
    {
        "name": "University of Cambridge",
        "country": "UK",
        "qs_rank": 2,
        "acceptance_rate": 0.21,
        "sat_25th": None,
        "sat_75th": None,
        "avg_gpa": 4.0,
        "min_ielts": 7.5,
        "majors": ["Computer Science", "Mathematics", "Physics", "Engineering", "Economics"],
        "deadline": "2026-10-15",
        "has_scholarship": True,
        "tuition_usd": 45860,
    },
    {
        "name": "University of Oxford",
        "country": "UK",
        "qs_rank": 3,
        "acceptance_rate": 0.17,
        "sat_25th": None,
        "sat_75th": None,
        "avg_gpa": 4.0,
        "min_ielts": 7.5,
        "majors": ["Computer Science", "Mathematics", "Physics", "Economics", "Law"],
        "deadline": "2026-10-15",
        "has_scholarship": True,
        "tuition_usd": 45860,
    },
    {
        "name": "Imperial College London",
        "country": "UK",
        "qs_rank": 8,
        "acceptance_rate": 0.14,
        "sat_25th": None,
        "sat_75th": None,
        "avg_gpa": 3.9,
        "min_ielts": 6.5,
        "majors": ["Computer Science", "Engineering", "Mathematics", "Physics", "Business"],
        "deadline": "2027-01-15",
        "has_scholarship": False,
        "tuition_usd": 42000,
    },
    {
        "name": "UCL",
        "country": "UK",
        "qs_rank": 9,
        "acceptance_rate": 0.63,
        "sat_25th": None,
        "sat_75th": None,
        "avg_gpa": 3.7,
        "min_ielts": 6.5,
        "majors": ["Computer Science", "Engineering", "Economics", "Law", "Mathematics"],
        "deadline": "2027-01-15",
        "has_scholarship": False,
        "tuition_usd": 35000,
    },
    # Switzerland
    {
        "name": "ETH Zürich",
        "country": "Switzerland",
        "qs_rank": 7,
        "acceptance_rate": 0.27,
        "sat_25th": None,
        "sat_75th": None,
        "avg_gpa": 4.0,
        "min_ielts": 7.0,
        "majors": ["Computer Science", "Engineering", "Mathematics", "Physics", "Architecture"],
        "deadline": "2026-12-15",
        "has_scholarship": False,
        "tuition_usd": 1460,
    },
    {
        "name": "EPFL",
        "country": "Switzerland",
        "qs_rank": 17,
        "acceptance_rate": 0.30,
        "sat_25th": None,
        "sat_75th": None,
        "avg_gpa": 3.9,
        "min_ielts": 7.0,
        "majors": ["Computer Science", "Engineering", "Mathematics", "Physics"],
        "deadline": "2027-01-15",
        "has_scholarship": False,
        "tuition_usd": 1460,
    },
    # Netherlands
    {
        "name": "TU Delft",
        "country": "Netherlands",
        "qs_rank": 49,
        "acceptance_rate": 0.65,
        "sat_25th": None,
        "sat_75th": None,
        "avg_gpa": 3.8,
        "min_ielts": 6.5,
        "majors": ["Computer Science", "Engineering", "Architecture", "Applied Mathematics"],
        "deadline": "2027-01-15",
        "has_scholarship": False,
        "tuition_usd": 15000,
    },
    {
        "name": "University of Amsterdam",
        "country": "Netherlands",
        "qs_rank": 53,
        "acceptance_rate": 0.55,
        "sat_25th": None,
        "sat_75th": None,
        "avg_gpa": 3.7,
        "min_ielts": 6.5,
        "majors": ["Computer Science", "Economics", "Law", "Psychology", "Business"],
        "deadline": "2027-02-01",
        "has_scholarship": False,
        "tuition_usd": 12000,
    },
    # Germany
    {
        "name": "TU Munich",
        "country": "Germany",
        "qs_rank": 30,
        "acceptance_rate": 0.30,
        "sat_25th": None,
        "sat_75th": None,
        "avg_gpa": 3.8,
        "min_ielts": 6.5,
        "majors": ["Computer Science", "Engineering", "Mathematics", "Physics", "Business"],
        "deadline": "2027-01-31",
        "has_scholarship": False,
        "tuition_usd": 300,
    },
    # Canada
    {
        "name": "University of Toronto",
        "country": "Canada",
        "qs_rank": 25,
        "acceptance_rate": 0.43,
        "sat_25th": 1240,
        "sat_75th": 1440,
        "avg_gpa": 3.7,
        "min_ielts": 6.5,
        "majors": ["Computer Science", "Engineering", "Mathematics", "Economics", "Biology"],
        "deadline": "2027-01-13",
        "has_scholarship": True,
        "tuition_usd": 48040,
    },
    {
        "name": "McGill University",
        "country": "Canada",
        "qs_rank": 46,
        "acceptance_rate": 0.41,
        "sat_25th": 1220,
        "sat_75th": 1420,
        "avg_gpa": 3.7,
        "min_ielts": 6.5,
        "majors": ["Computer Science", "Engineering", "Medicine", "Law", "Economics"],
        "deadline": "2027-01-15",
        "has_scholarship": True,
        "tuition_usd": 30000,
    },
    # Singapore
    {
        "name": "NUS",
        "country": "Singapore",
        "qs_rank": 8,
        "acceptance_rate": 0.20,
        "sat_25th": 1350,
        "sat_75th": 1530,
        "avg_gpa": 3.8,
        "min_ielts": 6.5,
        "majors": ["Computer Science", "Engineering", "Business", "Medicine", "Law"],
        "deadline": "2027-02-28",
        "has_scholarship": True,
        "tuition_usd": 28000,
    },
    # Australia
    {
        "name": "University of Melbourne",
        "country": "Australia",
        "qs_rank": 14,
        "acceptance_rate": 0.70,
        "sat_25th": None,
        "sat_75th": None,
        "avg_gpa": 3.6,
        "min_ielts": 6.5,
        "majors": ["Computer Science", "Engineering", "Business", "Law", "Medicine"],
        "deadline": "2026-10-31",
        "has_scholarship": True,
        "tuition_usd": 38000,
    },
    # South Korea
    {
        "name": "KAIST",
        "country": "South Korea",
        "qs_rank": 56,
        "acceptance_rate": 0.25,
        "sat_25th": 1350,
        "sat_75th": 1510,
        "avg_gpa": 3.9,
        "min_ielts": 6.5,
        "majors": ["Computer Science", "Engineering", "Mathematics", "Physics"],
        "deadline": "2026-12-01",
        "has_scholarship": True,
        "tuition_usd": 8000,
    },
    # Japan
    {
        "name": "University of Tokyo",
        "country": "Japan",
        "qs_rank": 32,
        "acceptance_rate": 0.33,
        "sat_25th": None,
        "sat_75th": None,
        "avg_gpa": 3.8,
        "min_ielts": 6.5,
        "majors": ["Computer Science", "Engineering", "Mathematics", "Economics", "Law"],
        "deadline": "2027-01-31",
        "has_scholarship": True,
        "tuition_usd": 5000,
    },
]


def main():
    print(f"Заполняем базу: {len(UNIVERSITIES)} университетов...")
    inserted = 0
    skipped = 0

    for uni in UNIVERSITIES:
        # Убираем None-значения чтобы не перезаписывать существующие
        payload = {k: v for k, v in uni.items() if v is not None}
        try:
            existing = (
                supabase.table("universities")
                .select("id")
                .eq("name", uni["name"])
                .eq("country", uni["country"])
                .execute()
            )
            if existing.data:
                print(f"  SKIP  {uni['name']} (уже есть)")
                skipped += 1
            else:
                supabase.table("universities").insert(payload).execute()
                print(f"  OK    {uni['name']} ({uni['country']})")
                inserted += 1
        except Exception as e:
            print(f"  ERR   {uni['name']}: {e}")

    print(f"\nГотово: вставлено {inserted}, пропущено {skipped}")


if __name__ == "__main__":
    main()
