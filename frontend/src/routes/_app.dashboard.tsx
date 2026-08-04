import { useEffect } from "react";
import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  TrendingUp, CalendarClock, GraduationCap, Sparkles,
  ArrowUpRight, CheckCircle2, Circle, Clock, Loader2,
} from "lucide-react";
import { api } from "@/lib/api";
import { formatAcceptance, type MatchResult, type MyListItem, type Deadline } from "@/lib/types";
import { LEVEL_META } from "@/lib/target-unis";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/dashboard")({
  component: Overview,
});

const tierStyle: Record<string, string> = {
  reach:  "bg-destructive/10 text-destructive",
  match:  "bg-[color-mix(in_oklab,#4694E7_18%,transparent)] text-[#1866B9]",
  safety: "bg-emerald-500/10 text-emerald-700",
};

function Overview() {
  const qc = useQueryClient();
  const search = useSearch({ strict: false }) as { upgraded?: string };

  useEffect(() => {
    if (search.upgraded === "1") {
      toast.success("Поздравляем! Ваш аккаунт успешно обновлен до Naviuni Pro 🎉");
      qc.invalidateQueries({ queryKey: ["billing-status"] });
      qc.invalidateQueries({ queryKey: ["profile"] });
    }
  }, [search.upgraded, qc]);


  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: () => api.profile.get(),
    retry: false,
  });

  const { data: myList = [], isLoading: listLoading } = useQuery({
    queryKey: ["my-list"],
    queryFn: () => api.universities.myList(),
  });

  const { data: matches = [], isLoading: matchLoading } = useQuery({
    queryKey: ["match"],
    queryFn: () => api.universities.match(),
    retry: false,
    enabled: !!profile,
  });

  const { data: deadlines = [], isLoading: deadlineLoading } = useQuery({
    queryKey: ["deadlines"],
    queryFn: () => api.deadlines.list(),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
      api.deadlines.update(id, { completed }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["deadlines"] }),
  });

  const firstName = profile?.full_name?.split(" ")[0] ?? "студент";

  const reachCount  = myList.filter((u: MyListItem) => u.category === "reach").length;
  const matchCount  = myList.filter((u: MyListItem) => u.category === "match" || !u.category).length;
  const safetyCount = myList.filter((u: MyListItem) => u.category === "safety").length;

  const pendingDeadlines = deadlines.filter((d: Deadline) => !d.completed);
  const nextDeadline = pendingDeadlines.sort((a: Deadline, b: Deadline) =>
    new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
  )[0];

  const daysUntilNext = nextDeadline
    ? Math.ceil((new Date(nextDeadline.due_date).getTime() - Date.now()) / 86400000)
    : null;

  const stats = [
    {
      label: "Целевых вузов",
      value: listLoading ? "…" : String(myList.length),
      delta: listLoading ? "" : `${reachCount} reach · ${matchCount} match · ${safetyCount} safety`,
      icon: GraduationCap,
    },
    {
      label: "Активных дедлайнов",
      value: deadlineLoading ? "…" : String(pendingDeadlines.length),
      delta: daysUntilNext != null
        ? `Ближайший через ${daysUntilNext} дн`
        : "Нет активных дедлайнов",
      icon: CalendarClock,
    },
    {
      label: "AI Подходящих вузов",
      value: matchLoading ? "…" : String(matches.length),
      delta: matchLoading ? "" : `из базы ${matches.length > 0 ? "— нажми «Университеты»" : "заполни профиль"}`,
      icon: Sparkles,
    },
    {
      label: "Профиль",
      value: profile ? "Готов" : "—",
      delta: profile?.major ?? "Заполни профиль",
      icon: TrendingUp,
    },
  ];

  const topMatches = matches.slice(0, 6);

  const upcomingTasks = deadlines
    .filter((d: Deadline) => !d.completed)
    .sort((a: Deadline, b: Deadline) =>
      new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
    )
    .slice(0, 5);

  const doneTasks = deadlines
    .filter((d: Deadline) => d.completed)
    .slice(0, 2);

  const displayTasks = [...upcomingTasks, ...doneTasks];

  function formatDue(due: string) {
    const d = new Date(due);
    const diff = Math.ceil((d.getTime() - Date.now()) / 86400000);
    if (diff < 0)  return "Просрочен";
    if (diff === 0) return "Сегодня";
    if (diff === 1) return "Завтра";
    return `Через ${diff} дн`;
  }

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Hero */}
      <div
        className="relative overflow-hidden rounded-[32px] p-8 lg:p-10 text-white shadow-2xl"
        style={{ background: "linear-gradient(135deg, #0F3269 0%, #1A4D9C 100%)" }}
      >
        <div className="absolute right-0 top-0 h-full w-1/3 opacity-10 pointer-events-none">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="h-full w-full rotate-12 transform scale-125">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
            <Sparkles className="h-3 w-3" /> ПЛАН ПОДАЧИ
          </div>
          <div className="text-sm font-bold text-blue-200/80 uppercase tracking-widest mb-1">
            Привет, {firstName}
          </div>
          <h1 className="font-display text-3xl lg:text-4xl font-extrabold leading-tight">
            {daysUntilNext != null
              ? `До ближайшего дедлайна ${daysUntilNext} дн`
              : myList.length === 0
              ? "Выбери целевые университеты"
              : `У тебя ${myList.length} целевых вузов`}
          </h1>
          <p className="mt-4 text-sm lg:text-base text-blue-100/80 leading-relaxed max-w-xl">
            {nextDeadline
              ? `Следующий дедлайн: ${nextDeadline.title}`
              : profile
              ? "Добавь университеты и дедлайны чтобы видеть прогресс здесь."
              : "Заполни профиль чтобы AI подобрал подходящие вузы."}
          </p>
          <div className="flex flex-wrap gap-3 mt-8">
            <Link
              to="/universities"
              className="bg-white text-[#0F3269] text-sm font-bold px-6 py-3 rounded-xl hover:bg-blue-50 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg"
            >
              Университеты
            </Link>
            <Link
              to="/profile"
              className="bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all text-sm font-bold px-6 py-3 rounded-xl border border-white/10 hover:scale-[1.02] active:scale-[0.98]"
            >
              Мой профиль
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-card border border-border rounded-xl p-5 hover:shadow-[var(--shadow-soft)] transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="text-xs text-muted-foreground">{s.label}</div>
              <s.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-semibold mt-2">{s.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{s.delta}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tasks / Deadlines */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold">Дедлайны</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {deadlineLoading ? "Загружаем…" : `${pendingDeadlines.length} активных дедлайнов`}
              </p>
            </div>
            <Link to="/deadlines" className="text-xs text-primary hover:underline flex items-center gap-1">
              Все дедлайны <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>

          {deadlineLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground text-sm py-4">
              <Loader2 className="h-4 w-4 animate-spin" /> Загружаем…
            </div>
          ) : displayTasks.length === 0 ? (
            <div className="text-sm text-muted-foreground py-4">
              Нет дедлайнов. Добавь университеты — дедлайны создадутся автоматически.
            </div>
          ) : (
            <ul className="space-y-1">
              {displayTasks.map((d: Deadline) => {
                const due = formatDue(d.due_date);
                const urgent = !d.completed && due === "Сегодня";
                return (
                  <li
                    key={d.id}
                    className="flex items-center gap-3 py-2.5 px-2 rounded-lg hover:bg-muted/60 transition-colors cursor-pointer"
                    onClick={() => toggleMutation.mutate({ id: d.id, completed: !d.completed })}
                  >
                    {d.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
                    )}
                    <span className={`flex-1 text-sm ${d.completed ? "line-through text-muted-foreground" : ""}`}>
                      {d.title}
                    </span>
                    <span className={`text-xs flex items-center gap-1 ${urgent ? "text-destructive font-medium" : "text-muted-foreground"}`}>
                      <Clock className="h-3 w-3" /> {due}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Match summary */}
        <div
          className="rounded-xl p-6 text-white relative overflow-hidden"
          style={{ background: "var(--gradient-deep)" }}
        >
          <Sparkles className="h-5 w-5 text-white/80" />
          <h3 className="font-semibold mt-3">AI матчинг</h3>
          <p className="text-sm text-white/80 mt-2 leading-relaxed">
            {matchLoading
              ? "Анализируем профиль…"
              : matches.length > 0
              ? `Найдено ${matches.length} подходящих вузов по твоему профилю.`
              : profile
              ? "Заполни SAT, GPA и IELTS для получения матчинга."
              : "Заполни профиль для AI подбора вузов."}
          </p>
          {matches.length > 0 && (
            <div className="mt-4 space-y-2 text-xs">
              {(["reach", "match", "safety"] as const).map((cat) => {
                const count = matches.filter((m: MatchResult) => m.category === cat).length;
                const pct = Math.round((count / matches.length) * 100);
                return (
                  <div key={cat}>
                    <div className="flex justify-between text-white/80">
                      <span>{LEVEL_META[cat].label}</span>
                      <span>{count} вузов</span>
                    </div>
                    <div className="h-1.5 bg-white/15 rounded-full mt-1 overflow-hidden">
                      <div className="h-full bg-white rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <Link
            to="/universities"
            className="mt-5 block text-center text-sm bg-white/15 hover:bg-white/25 transition rounded-lg py-2 font-medium"
          >
            Смотреть вузы
          </Link>
        </div>
      </div>

      {/* Top matches table */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold">AI подборка</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {matchLoading ? "Загружаем…" : profile ? `Топ ${topMatches.length} вузов по твоему профилю` : "Заполни профиль для AI подборки"}
            </p>
          </div>
          <Link to="/universities" className="text-xs text-primary hover:underline flex items-center gap-1">
            Все вузы <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>

        {matchLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground text-sm py-4">
            <Loader2 className="h-4 w-4 animate-spin" /> Загружаем матчинг…
          </div>
        ) : topMatches.length === 0 ? (
          <div className="text-sm text-muted-foreground py-4">
            {profile
              ? "Нет данных матчинга. Убедись что профиль заполнен (SAT, GPA, IELTS)."
              : "Заполни профиль для получения AI подборки университетов."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground border-b border-border">
                  <th className="font-medium py-2.5">Университет</th>
                  <th className="font-medium">Страна</th>
                  <th className="font-medium">Тип</th>
                  <th className="font-medium">Совпадение</th>
                  <th className="font-medium">Прием</th>
                </tr>
              </thead>
              <tbody>
                {topMatches.map((m: MatchResult) => {
                  const pct = Math.round(m.match_score * 100);
                  return (
                    <tr key={m.university.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                      <td className="py-3 font-medium">{m.university.name}</td>
                      <td className="text-muted-foreground">{m.university.country}</td>
                      <td>
                        <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${tierStyle[m.category]}`}>
                          {LEVEL_META[m.category].label}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2 w-32">
                          <div className="h-1.5 flex-1 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${pct}%`, background: "var(--gradient-brand)" }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground w-8">{pct}%</span>
                        </div>
                      </td>
                      <td className="text-muted-foreground">{formatAcceptance(m.university.acceptance_rate)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
