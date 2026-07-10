import type { Achievement, AchievementLevel, AchievementType } from "./types";

export type ProfileCategory = "academics" | "activities" | "leadership" | "awards";

export type CategoryScores = Record<ProfileCategory, number>;

type Contribution = Partial<Record<ProfileCategory, number>>;

// Вклад активности в категории (0..N баллов до нормализации)
const OLYMPIAD_WEIGHTS: Record<AchievementLevel, Contribution> = {
  school: { academics: 5, awards: 5 },
  city: { academics: 8, awards: 10 },
  national: { academics: 15, awards: 20 },
  international: { academics: 20, awards: 30 },
};

const TYPE_WEIGHTS: Partial<Record<AchievementType, Contribution>> = {
  volunteering: { activities: 10, leadership: 5 },
  internship: { activities: 12, academics: 5 },
  leadership: { leadership: 15, activities: 5 },
  project: { activities: 8, academics: 6 },
  research: { academics: 15, awards: 8 },
};

export const CATEGORY_ORDER: ProfileCategory[] = ["academics", "activities", "leadership", "awards"];

function resolveContribution(achievement: Pick<Achievement, "type" | "level">): Contribution {
  if (!achievement.type) return {};
  if (achievement.type === "olympiad") {
    const level = achievement.level && OLYMPIAD_WEIGHTS[achievement.level]
      ? achievement.level
      : "school";
    return OLYMPIAD_WEIGHTS[level];
  }
  return TYPE_WEIGHTS[achievement.type] ?? {};
}

// Реальные баллы из профиля (GPA/SAT/IELTS/TOEFL) — база для категории Academics,
// поверх которой суммируются очки от достижений (олимпиады, research и т.д.)
export type AcademicInputs = {
  gpa: number | null;
  gpaScale: number | null;
  satTotal: number | null;
  ielts: number | null;
  toefl: number | null;
};

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function computeAcademicBase(inputs?: AcademicInputs): number {
  if (!inputs) return 0;
  const axes: { value: number; weight: number }[] = [];

  if (inputs.gpa) {
    axes.push({ value: clamp01(inputs.gpa / (inputs.gpaScale || 4)), weight: 0.4 });
  }
  if (inputs.satTotal) {
    axes.push({ value: clamp01((inputs.satTotal - 400) / 1200), weight: 0.4 });
  }
  if (inputs.ielts) {
    axes.push({ value: clamp01(inputs.ielts / 9), weight: 0.2 });
  } else if (inputs.toefl) {
    axes.push({ value: clamp01(inputs.toefl / 120), weight: 0.2 });
  }

  if (axes.length === 0) return 0;
  const totalWeight = axes.reduce((sum, a) => sum + a.weight, 0);
  const weighted = axes.reduce((sum, a) => sum + a.value * a.weight, 0);
  return Math.round((weighted / totalWeight) * 100);
}

export function scoreProfile(
  achievements: Pick<Achievement, "type" | "level">[],
  academicInputs?: AcademicInputs,
): { scores: CategoryScores; overall: number } {
  const scores: CategoryScores = {
    academics: computeAcademicBase(academicInputs),
    activities: 0,
    leadership: 0,
    awards: 0,
  };

  for (const achievement of achievements) {
    const contribution = resolveContribution(achievement);
    for (const category of CATEGORY_ORDER) {
      scores[category] += contribution[category] ?? 0;
    }
  }

  for (const category of CATEGORY_ORDER) {
    scores[category] = Math.min(Math.round(scores[category]), 100);
  }

  const overall = Math.round(
    CATEGORY_ORDER.reduce((sum, category) => sum + scores[category], 0) / CATEGORY_ORDER.length,
  );

  return { scores, overall };
}

const STRENGTH_MESSAGES: Record<ProfileCategory, string> = {
  academics: "Сильная академическая база — олимпиады и исследовательские проекты усиливают заявку.",
  activities: "Много разноплановых активностей — профиль выглядит разносторонним.",
  leadership: "Заметный лидерский опыт — приёмные комиссии это ценят.",
  awards: "Хороший набор наград и призовых мест.",
};

const WEAKNESS_TIPS: Record<ProfileCategory, string> = {
  academics: "Добавь research-проект или участие в олимпиаде — усилит академическую часть профиля.",
  activities: "Активностей маловато — попробуй волонтёрство или стажировку, это расширит профиль.",
  leadership: "Не хватает лидерского опыта — возьми на себя роль организатора в проекте или активности.",
  awards: "Мало наград — 1-2 результата на олимпиаде или конкурсе приблизят к сильному профилю.",
};

export function getInsights(scores: CategoryScores): {
  strongest: ProfileCategory;
  weakest: ProfileCategory;
  strengths: string[];
  improvements: string[];
} {
  const sorted = [...CATEGORY_ORDER].sort((a, b) => scores[b] - scores[a]);
  const strongest = sorted[0];
  const weakest = sorted[sorted.length - 1];
  return {
    strongest,
    weakest,
    strengths: [STRENGTH_MESSAGES[strongest]],
    improvements: [WEAKNESS_TIPS[weakest]],
  };
}

export const CATEGORY_LABELS: Record<ProfileCategory, string> = {
  academics: "Academics",
  activities: "Activities",
  leadership: "Leadership",
  awards: "Awards",
};
