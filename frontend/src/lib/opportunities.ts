import { useEffect, useState } from "react";

export type OppCategory = "internship" | "research" | "olympiad" | "volunteer";
export type OppFormat = "Онлайн" | "Офлайн" | "Гибрид";
export type OppCost = "free" | "paid" | "stipend";

export type Opportunity = {
  id: string;
  title: string;
  org: string | null;
  category: OppCategory;
  country: string | null;
  format: OppFormat | null;
  cost: OppCost | null;
  cost_label: string | null;
  grades: number[]; // 9, 10, 11, 12
  level: string | null;
  deadline: string | null; // ISO date, null = rolling/TBD
  duration: string | null;
  tags: string[];
  prestige: number | null; // 1..5
  about: string | null;
  link?: string | null;
  source: string;
  verified: boolean;
};

export const CATEGORY_META: Record<
  OppCategory,
  { label: string; tone: string; emoji: string; available: boolean }
> = {
  internship: {
    label: "Стажировки",
    tone: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    emoji: "💼",
    available: true,
  },
  research: {
    label: "Исследования",
    tone: "bg-violet-500/10 text-violet-600 border-violet-500/20",
    emoji: "🔬",
    available: true,
  },
  olympiad: {
    label: "Олимпиады",
    tone: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    emoji: "🏆",
    available: true,
  },
  volunteer: {
    label: "Волонтёрство",
    tone: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    emoji: "🤝",
    available: true,
  },
};


const FAV_KEY = "opp-fav-v1";
const MINE_KEY = "opp-mine-v1";
const DEADLINE_KEY = "opp-deadline-v1";

function read(key: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(key: string, list: string[]) {
  localStorage.setItem(key, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent("opp-change"));
}

function useStringSet(key: string) {
  const [list, setList] = useState<string[]>(() => read(key));
  useEffect(() => {
    const sync = () => setList(read(key));
    window.addEventListener("opp-change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("opp-change", sync);
      window.removeEventListener("storage", sync);
    };
  }, [key]);
  const toggle = (id: string) => {
    const cur = read(key);
    write(key, cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]);
  };
  return { list, toggle, has: (id: string) => list.includes(id) };
}

export const useFavorites = () => useStringSet(FAV_KEY);
export const useMyActivities = () => useStringSet(MINE_KEY);
export const useCreatedDeadlines = () => useStringSet(DEADLINE_KEY);

// "AI-подсказка" — heuristic explaining why activity fits the student.
// Uses profile interests + target unis + opportunity tags.
export function whyItFits(
  opp: Opportunity,
  ctx: {
    interests: string[];
    targetCountries: string[];
    grade: number;
    major: string;
  },
): { points: string[]; score: number } {
  const points: string[] = [];
  let score = 50;

  const tagText = opp.tags.join(" ").toLowerCase() + " " + (opp.about ?? "").toLowerCase();

  const interestHits = ctx.interests.filter((i) => {
    const key = i.toLowerCase().split(/[\s/]/)[0];
    return tagText.includes(key);
  });
  if (interestHits.length) {
    score += 20;
    points.push(
      `Совпадает с твоими интересами: ${interestHits.join(", ")} — программа усилит именно ту часть профиля, которую видят приёмные комиссии.`,
    );
  }

  if (opp.tags.some((t) => t.toLowerCase().includes("cs")) && ctx.major.toLowerCase().includes("computer")) {
    score += 10;
    points.push(
      `Прямая привязка к твоему мейджору (${ctx.major}): research/опыт здесь напрямую цитируется в эссе и Common App activities.`,
    );
  }

  const countryHit = !!opp.country && ctx.targetCountries.some((c) => opp.country!.includes(c));
  if (countryHit) {
    score += 10;
    points.push(
      `Локация программы (${opp.country}) пересекается с твоими целевыми странами — это знакомит admissions officers с твоим именем заранее.`,
    );
  }

  if (opp.grades.includes(ctx.grade)) {
    score += 5;
    points.push(`Подходит по классу (${ctx.grade}-й) — успеваешь подать до дедлайна без потери года.`);
  } else {
    score -= 10;
    points.push(`Программа обычно набирает ${opp.grades.join(", ")} классы — стоит уточнить, рассмотрят ли тебя.`);
  }

  if ((opp.prestige ?? 0) >= 5) {
    score += 10;
    points.push(
      "Tier-1 престиж: попадание сюда — сильный сигнал для top-20 вузов, особенно Ivy+ и MIT/Stanford.",
    );
  } else if ((opp.prestige ?? 0) >= 4) {
    score += 5;
    points.push("Высокий уровень программы — отличный «cornerstone» для extracurriculars-секции.");
  }

  if (opp.cost === "stipend") {
    points.push("Программа оплачиваемая — это +1 к разделу work experience, не только activity.");
  }

  return { points, score: Math.min(98, Math.max(20, score)) };
}
