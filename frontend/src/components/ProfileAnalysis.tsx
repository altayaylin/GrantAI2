import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sparkles, Lightbulb, TrendingUp, Target, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  getInsights,
  scoreProfile,
  type ProfileCategory,
} from "@/lib/profileScore";

const CATEGORY_COLOR_VARS: Record<ProfileCategory, string> = {
  academics: "var(--chart-3)",
  activities: "var(--chart-2)",
  leadership: "var(--chart-1)",
  awards: "var(--chart-4)",
};

function useMountAnimation(): boolean {
  const [animate, setAnimate] = useState(false);
  useEffect(() => {
    const raf1 = requestAnimationFrame(() => {
      requestAnimationFrame(() => setAnimate(true));
    });
    return () => cancelAnimationFrame(raf1);
  }, []);
  return animate;
}

function ScoreRing({ value, animate }: { value: number; animate: boolean }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - (animate ? value : 0) / 100);

  return (
    <div className="relative h-32 w-32 shrink-0">
      <svg viewBox="0 0 120 120" className="h-32 w-32 -rotate-90">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="var(--border)" strokeWidth="10" />
        <defs>
          <linearGradient id="profileScoreRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4694E7" />
            <stop offset="100%" stopColor="#1866B9" />
          </linearGradient>
        </defs>
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="url(#profileScoreRingGradient)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.16, 1, 0.3, 1)" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center leading-none">
          <div className="text-3xl font-extrabold">{value}</div>
          <div className="text-[10px] text-muted-foreground mt-1">/ 100</div>
        </div>
      </div>
    </div>
  );
}

function CategoryBar({
  category, value, animate,
}: {
  category: ProfileCategory;
  value: number;
  animate: boolean;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-medium">{CATEGORY_LABELS[category]}</span>
        <span className="text-sm text-muted-foreground">{value}</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full origin-left"
          style={{
            background: CATEGORY_COLOR_VARS[category],
            transform: `scaleX(${(animate ? value : 0) / 100})`,
            transition: "transform 1s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        />
      </div>
    </div>
  );
}

export function ProfileAnalysis() {
  const { data: achievements = [], isLoading: achievementsLoading } = useQuery({
    queryKey: ["achievements"],
    queryFn: () => api.achievements.list(),
  });

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: () => api.profile.get(),
    retry: false,
  });

  const animate = useMountAnimation();

  if (achievementsLoading || profileLoading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)] flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Загружаем анализ профиля…
      </div>
    );
  }

  const { scores, overall } = scoreProfile(achievements, {
    gpa: profile?.gpa ?? null,
    gpaScale: profile?.gpa_scale ?? null,
    satTotal: profile?.sat_total ?? null,
    ielts: profile?.ielts ?? null,
    toefl: profile?.toefl ?? null,
  });
  const insights = getInsights(scores);
  const isEmpty = overall === 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <section className="lg:col-span-2 rounded-2xl border border-border bg-card p-5 md:p-6 shadow-[var(--shadow-soft)]">
        <div className="flex items-center gap-2 mb-5">
          <div className="h-8 w-8 rounded-lg grid place-items-center bg-primary/10 text-primary">
            <Sparkles className="h-4 w-4" />
          </div>
          <h2 className="font-semibold">Анализ профиля</h2>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-8">
          <ScoreRing value={overall} animate={animate} />
          <div className="flex-1 w-full space-y-4">
            {CATEGORY_ORDER.map((category) => (
              <CategoryBar key={category} category={category} value={scores[category]} animate={animate} />
            ))}
          </div>
        </div>
        {isEmpty && (
          <p className="text-xs text-muted-foreground mt-5 text-center">
            Добавь достижения или заполни баллы (GPA, SAT, IELTS) в профиле, чтобы увидеть анализ
          </p>
        )}
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 md:p-6 shadow-[var(--shadow-soft)]">
        <div className="flex items-center gap-2 mb-5">
          <div className="h-8 w-8 rounded-lg grid place-items-center bg-primary/10 text-primary">
            <Lightbulb className="h-4 w-4" />
          </div>
          <h2 className="font-semibold">Сильные стороны и зоны роста</h2>
        </div>
        {isEmpty ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            Добавь достижения или заполни баллы (GPA, SAT, IELTS) в профиле, чтобы увидеть анализ
          </p>
        ) : (
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-600 mb-2">
                <TrendingUp className="h-3.5 w-3.5" /> Сильные стороны
              </div>
              <ul className="space-y-1.5">
                {insights.strengths.map((text) => (
                  <li
                    key={text}
                    className="text-sm text-foreground/90 leading-relaxed pl-3 border-l-2 border-emerald-500/40"
                  >
                    {text}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-600 mb-2">
                <Target className="h-3.5 w-3.5" /> Зоны роста
              </div>
              <ul className="space-y-1.5">
                {insights.improvements.map((text) => (
                  <li
                    key={text}
                    className="text-sm text-foreground/90 leading-relaxed pl-3 border-l-2 border-amber-500/40"
                  >
                    {text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
