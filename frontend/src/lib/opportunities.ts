import { useEffect, useState } from "react";

export type OppCategory = "internship" | "research" | "olympiad" | "volunteer";
export type OppFormat = "Онлайн" | "Офлайн" | "Гибрид";
export type OppCost = "free" | "paid" | "stipend";

export type Opportunity = {
  id: string;
  title: string;
  org: string;
  category: OppCategory;
  country: string;
  format: OppFormat;
  cost: OppCost;
  costLabel: string;
  grades: number[]; // 9, 10, 11, 12
  level: "Начальный" | "Средний" | "Продвинутый";
  deadline: string; // ISO date
  duration: string;
  tags: string[];
  prestige: number; // 1..5
  about: string;
  link?: string;
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
    available: false,
  },
  volunteer: {
    label: "Волонтёрство",
    tone: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    emoji: "🤝",
    available: false,
  },
};

export const OPPORTUNITIES: Opportunity[] = [
  // ===== Стажировки =====
  {
    id: "google-step",
    title: "Google STEP Internship",
    org: "Google",
    category: "internship",
    country: "США / Европа",
    format: "Гибрид",
    cost: "stipend",
    costLabel: "Оплачиваемая",
    grades: [11, 12],
    level: "Продвинутый",
    deadline: "2026-02-01",
    duration: "12 недель, лето",
    tags: ["CS", "Software Engineering", "Big Tech"],
    prestige: 5,
    about:
      "Программа Google для первокурсников и продвинутых старшеклассников. Реальные проекты с инженерными менторами, оплата + переезд.",
  },
  {
    id: "jane-street-amp",
    title: "Jane Street AMP",
    org: "Jane Street",
    category: "internship",
    country: "Великобритания / США",
    format: "Офлайн",
    cost: "stipend",
    costLabel: "Оплачиваемая",
    grades: [11, 12],
    level: "Продвинутый",
    deadline: "2026-01-15",
    duration: "5 недель, лето",
    tags: ["Quant", "Finance", "Math", "CS"],
    prestige: 5,
    about:
      "Academy of Math and Programming — программа от ведущего quant-фонда. Идеально для тех, кто рассматривает количественные финансы.",
  },
  {
    id: "yandex-ml-school",
    title: "Школа анализа данных, Yandex",
    org: "Yandex",
    category: "internship",
    country: "Казахстан / Онлайн",
    format: "Гибрид",
    cost: "free",
    costLabel: "Бесплатно",
    grades: [11, 12],
    level: "Средний",
    deadline: "2026-03-10",
    duration: "8 недель",
    tags: ["ML", "Data Science", "CS"],
    prestige: 4,
    about:
      "Интенсив по машинному обучению с лекциями инженеров Yandex и проектной работой. Сертификат + возможность стажировки.",
  },
  {
    id: "nu-cs-intern",
    title: "Nazarbayev University CS Lab Intern",
    org: "NU School of Engineering",
    category: "internship",
    country: "Казахстан",
    format: "Офлайн",
    cost: "free",
    costLabel: "Бесплатно",
    grades: [10, 11, 12],
    level: "Средний",
    deadline: "2026-04-20",
    duration: "Лето, 6–10 недель",
    tags: ["CS", "Research", "Local"],
    prestige: 3,
    about:
      "Стажировка в лабораториях NU. Подходит для усиления research-профиля в Казахстане до выпуска.",
  },

  // ===== Исследования =====
  {
    id: "mit-primes",
    title: "MIT PRIMES-USA",
    org: "Massachusetts Institute of Technology",
    category: "research",
    country: "США / Удалённо",
    format: "Онлайн",
    cost: "free",
    costLabel: "Бесплатно",
    grades: [10, 11],
    level: "Продвинутый",
    deadline: "2025-11-30",
    duration: "1 год, удалённо",
    tags: ["Math", "CS", "Research", "Top-tier"],
    prestige: 5,
    about:
      "Годовая программа исследований по математике и CS под менторством PhD из MIT. Один из самых сильных research-проектов для школьников.",
  },
  {
    id: "rsi",
    title: "Research Science Institute (RSI)",
    org: "CEE × MIT",
    category: "research",
    country: "США",
    format: "Офлайн",
    cost: "free",
    costLabel: "Полностью покрыто",
    grades: [11],
    level: "Продвинутый",
    deadline: "2026-01-12",
    duration: "6 недель, лето",
    tags: ["STEM", "Research", "Top-tier"],
    prestige: 5,
    about:
      "Самая престижная летняя research-программа в мире для школьников. Принимают ~80 человек глобально, полная стипендия.",
  },
  {
    id: "pioneer",
    title: "Pioneer Research Program",
    org: "Pioneer Academics",
    category: "research",
    country: "Онлайн",
    format: "Онлайн",
    cost: "paid",
    costLabel: "$6 500 (есть финпомощь)",
    grades: [10, 11, 12],
    level: "Средний",
    deadline: "2026-02-28",
    duration: "4 месяца",
    tags: ["Research", "1-on-1", "Любая дисциплина"],
    prestige: 4,
    about:
      "Индивидуальный research-проект с профессором американского университета. Можно выбрать тему: AI, экономика, биология и др.",
  },
  {
    id: "polygence",
    title: "Polygence Core",
    org: "Polygence",
    category: "research",
    country: "Онлайн",
    format: "Онлайн",
    cost: "paid",
    costLabel: "$2 500 (есть scholarships)",
    grades: [9, 10, 11, 12],
    level: "Начальный",
    deadline: "2026-05-15",
    duration: "10 встреч / 3 мес",
    tags: ["Research", "Mentorship", "Любая тема"],
    prestige: 3,
    about:
      "Подбирают ментора-PhD под твою тему и за 3 месяца помогают довести research-проект до публикации или продукта.",
  },
];

const FAV_KEY = "opp-fav-v1";
const MINE_KEY = "opp-mine-v1";

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

  const tagText = opp.tags.join(" ").toLowerCase() + " " + opp.about.toLowerCase();

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

  const countryHit = ctx.targetCountries.some((c) => opp.country.includes(c));
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

  if (opp.prestige >= 5) {
    score += 10;
    points.push(
      "Tier-1 престиж: попадание сюда — сильный сигнал для top-20 вузов, особенно Ivy+ и MIT/Stanford.",
    );
  } else if (opp.prestige >= 4) {
    score += 5;
    points.push("Высокий уровень программы — отличный «cornerstone» для extracurriculars-секции.");
  }

  if (opp.cost === "stipend") {
    points.push("Программа оплачиваемая — это +1 к разделу work experience, не только activity.");
  }

  return { points, score: Math.min(98, Math.max(20, score)) };
}
