from app.models.profile import StudentProfile
from app.models.university import University
from app.services.matching import match_score, categorize, passes_hard_filters, match_universities


def make_student(**kwargs):
    defaults = dict(
        id="test",
        major="Computer Science",
        target_countries=["USA"],
        gpa=3.9,
        gpa_scale=4.0,
        sat_total=1500,
        activities_count=4,
        awards_count=3,
    )
    defaults.update(kwargs)
    return StudentProfile(**defaults)


def make_mit():
    return University(
        id="mit",
        name="MIT",
        country="USA",
        acceptance_rate=0.04,
        sat_25th=1510,
        sat_75th=1580,
        avg_gpa=4.17,
        majors=["Computer Science", "Mathematics", "Physics"],
    )


def make_tu_delft():
    return University(
        id="delft",
        name="TU Delft",
        country="Netherlands",
        acceptance_rate=0.65,
        sat_25th=1380,
        sat_75th=1480,
        avg_gpa=3.8,
        min_ielts=6.5,
        majors=["Computer Science", "Engineering"],
    )


# --- Hard filter tests ---

def test_hard_filter_country():
    student = make_student(target_countries=["Germany"])
    assert passes_hard_filters(student, make_mit()) is False


def test_hard_filter_country_passes():
    student = make_student(target_countries=["USA"])
    assert passes_hard_filters(student, make_mit()) is True


def test_hard_filter_major():
    student = make_student(major="Economics")
    assert passes_hard_filters(student, make_mit()) is False


def test_hard_filter_ielts():
    student = make_student(ielts=6.0, target_countries=["Netherlands"])
    assert passes_hard_filters(student, make_tu_delft()) is False


def test_hard_filter_no_target_countries_excludes():
    student = make_student(target_countries=[])
    assert passes_hard_filters(student, make_mit()) is False


def test_hard_filter_no_major_excludes():
    student = make_student(major=None)
    assert passes_hard_filters(student, make_mit()) is False


def test_hard_filter_uni_without_majors_excludes():
    student = make_student()
    uni = make_mit()
    uni.majors = []
    assert passes_hard_filters(student, uni) is False


# --- Category tests ---

def test_very_selective_is_reach():
    student = make_student()
    uni = make_mit()
    score = match_score(student, uni)
    category, reasons = categorize(student, uni, score)
    assert category == "reach"
    assert any("селективность" in r for r in reasons)


def test_match_category():
    student = make_student(sat_total=1420, target_countries=["Netherlands"])
    uni = make_tu_delft()
    score = match_score(student, uni)
    category, _ = categorize(student, uni, score)
    assert category in ("match", "safety")


def test_reach_low_sat():
    student = make_student(sat_total=1200, target_countries=["Netherlands"])
    uni = make_tu_delft()
    score = match_score(student, uni)
    category, _ = categorize(student, uni, score)
    assert category == "reach"


# --- Full pipeline test ---

def test_match_universities_filters_country():
    student = make_student(target_countries=["USA"])
    universities = [make_mit(), make_tu_delft()]
    results = match_universities(student, universities)
    names = [r.university.name for r in results]
    assert "MIT" in names
    assert "TU Delft" not in names


def test_match_universities_sorted_by_score():
    student = make_student(target_countries=["USA", "Netherlands"])
    universities = [make_mit(), make_tu_delft()]
    results = match_universities(student, universities)
    assert len(results) == 2
    assert results[0].match_score >= results[1].match_score
