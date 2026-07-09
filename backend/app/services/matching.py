from typing import List, Tuple
from app.models.profile import StudentProfile
from app.models.university import University, MatchResult


def clamp(value: float, low: float = 0.0, high: float = 1.0) -> float:
    return max(low, min(high, value))


def passes_hard_filters(student: StudentProfile, uni: University) -> bool:
    """Жёсткие фильтры: вуз вылетает, если не проходит базовые требования.

    Рекомендации показываются только по выбранным целевым странам и только
    если мейджор студента есть среди специальностей вуза — оба условия
    обязательны, без профиля (страны/мейджор) подбор не выдаёт ничего.
    """
    if not student.target_countries or uni.country not in student.target_countries:
        return False
    if not student.major or not uni.majors:
        return False
    student_major = student.major.strip().lower()
    if student_major not in (m.strip().lower() for m in uni.majors):
        return False
    if uni.min_ielts and student.ielts and student.ielts < uni.min_ielts:
        return False
    if uni.min_toefl and student.toefl and student.toefl < uni.min_toefl:
        return False
    return True


def normalize_gpa(student: StudentProfile) -> float:
    """Приводим GPA к шкале 4.0 для честного сравнения."""
    if not student.gpa:
        return 0.0
    return (student.gpa / student.gpa_scale) * 4.0


def compute_axes(student: StudentProfile, uni: University) -> dict:
    """Считаем совпадение по каждой оси (0..1)."""
    axes: dict = {}

    if student.sat_total and uni.sat_25th and uni.sat_75th:
        spread = uni.sat_75th - uni.sat_25th
        if spread > 0:
            axes["sat"] = clamp((student.sat_total - uni.sat_25th) / spread)
        else:
            axes["sat"] = 1.0 if student.sat_total >= uni.sat_25th else 0.0

    if uni.avg_gpa and student.gpa:
        student_gpa = normalize_gpa(student)
        axes["gpa"] = clamp(student_gpa / uni.avg_gpa)

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

    return score / total_weight if total_weight > 0 else 0.0


def categorize(
    student: StudentProfile,
    uni: University,
    score: float,
) -> Tuple[str, List[str]]:
    """
    Категория считается по тому, ГДЕ профиль стоит относительно
    диапазона поступивших — не как 'шанс', а как соответствие.
    """
    reasons: List[str] = []

    above_75 = (
        student.sat_total and uni.sat_75th
        and student.sat_total >= uni.sat_75th
    )
    below_25 = (
        student.sat_total and uni.sat_25th
        and student.sat_total < uni.sat_25th
    )

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

    if uni.has_scholarship:
        reasons.append("Вуз предлагает стипендии")

    return category, reasons


def match_universities(
    student: StudentProfile,
    universities: List[University],
) -> List[MatchResult]:
    """Главная функция: прогоняет все вузы через движок подбора."""
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

    results.sort(key=lambda r: r.match_score, reverse=True)
    return results
