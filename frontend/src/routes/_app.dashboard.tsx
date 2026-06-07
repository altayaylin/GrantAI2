import { createFileRoute } from "@tanstack/react-router";
import {
  TrendingUp,
  CalendarClock,
  GraduationCap,
  Sparkles,
  ArrowUpRight,
  CheckCircle2,
  Circle,
  Clock,
} from "lucide-react";

export const Route = createFileRoute("/_app/dashboard")({
  component: Overview,
});

const stats = [
  { label: "Готовность профиля", value: "72%", delta: "+8% за неделю", icon: TrendingUp },
  { label: "Активных дедлайнов", value: "5", delta: "Ближайший через 12 дн", icon: CalendarClock },
  { label: "Подходящих вузов", value: "23", delta: "4 reach · 12 match · 7 safety", icon: GraduationCap },
  { label: "AI оценка профиля", value: "B+", delta: "Сильный по CS", icon: Sparkles },
];

const tasks = [
  { title: "Загрузить SAT score (Math)", due: "Сегодня", done: false, urgent: true },
  { title: "Эссе Common App — черновик 1", due: "Через 3 дня", done: false },
  { title: "Запросить рекомендацию у учителя физики", due: "Через 5 дней", done: false },
  { title: "Обновить список волонтёрства", due: "Готово", done: true },
  { title: "IELTS — записаться на экзамен", due: "Готово", done: true },
];

const universities = [
  { name: "MIT", country: "США", chance: 18, tier: "Reach", deadline: "1 Jan" },
  { name: "ETH Zürich", country: "Швейцария", chance: 42, tier: "Match", deadline: "15 Dec" },
  { name: "TU Delft", country: "Нидерланды", chance: 64, tier: "Match", deadline: "15 Jan" },
  { name: "Nazarbayev University", country: "Казахстан", chance: 88, tier: "Safety", deadline: "20 Mar" },
];

const tierStyle: Record<string, string> = {
  Reach: "bg-destructive/10 text-destructive",
  Match: "bg-[color-mix(in_oklab,#4694E7_18%,transparent)] text-[#1866B9]",
  Safety: "bg-emerald-500/10 text-emerald-700",
};

function Overview() {
  return (
    <div className="space-y-6 max-w-7xl">
      {/* Hero */}
      <div
        className="rounded-2xl p-6 lg:p-8 text-white relative overflow-hidden"
        style={{ background: "var(--gradient-brand)" }}
      >
        <div className="absolute -right-10 -bottom-10 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
        <div className="relative max-w-2xl">
          <div className="text-xs uppercase tracking-wider text-white/80">
            Привет, Алишер
          </div>
          <h1 className="text-2xl lg:text-3xl font-semibold mt-1">
            До дедлайна MIT осталось 12 дней
          </h1>
          <p className="text-white/85 mt-2 text-sm">
            Ты выполнил 14 из 21 задачи. Сосредоточься на эссе и втором SAT — это даст +6% к оценке профиля.
          </p>
          <div className="flex flex-wrap gap-2 mt-5">
            <button className="bg-white text-[#1866B9] text-sm font-medium px-4 py-2 rounded-lg hover:bg-white/90 transition">
              Открыть план подачи
            </button>
            <button className="bg-white/15 hover:bg-white/25 transition text-sm font-medium px-4 py-2 rounded-lg">
              Сгенерировать AI отчёт
            </button>
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
        {/* Tasks */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold">Задачи на эту неделю</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Сгенерировано из твоего плана подачи
              </p>
            </div>
            <button className="text-xs text-primary hover:underline flex items-center gap-1">
              Все задачи <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
          <ul className="space-y-1">
            {tasks.map((t) => (
              <li
                key={t.title}
                className="flex items-center gap-3 py-2.5 px-2 rounded-lg hover:bg-muted/60 transition-colors"
              >
                {t.done ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
                )}
                <span
                  className={`flex-1 text-sm ${
                    t.done ? "line-through text-muted-foreground" : ""
                  }`}
                >
                  {t.title}
                </span>
                <span
                  className={`text-xs flex items-center gap-1 ${
                    t.urgent ? "text-destructive font-medium" : "text-muted-foreground"
                  }`}
                >
                  <Clock className="h-3 w-3" /> {t.due}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* AI summary */}
        <div
          className="rounded-xl p-6 text-white relative overflow-hidden"
          style={{ background: "var(--gradient-deep)" }}
        >
          <Sparkles className="h-5 w-5 text-white/80" />
          <h3 className="font-semibold mt-3">AI саммари профиля</h3>
          <p className="text-sm text-white/80 mt-2 leading-relaxed">
            Сильная математическая база (SAT Math 780), 2 года олимпиад по информатике. Слабее — soft skills и международный опыт.
          </p>
          <div className="mt-4 space-y-2 text-xs">
            {[
              ["Академика", 88],
              ["Внеклассное", 64],
              ["Эссе", 41],
            ].map(([k, v]) => (
              <div key={k as string}>
                <div className="flex justify-between text-white/80">
                  <span>{k}</span>
                  <span>{v}%</span>
                </div>
                <div className="h-1.5 bg-white/15 rounded-full mt-1 overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full"
                    style={{ width: `${v}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <button className="mt-5 w-full text-sm bg-white/15 hover:bg-white/25 transition rounded-lg py-2 font-medium">
            Получить рекомендации
          </button>
        </div>
      </div>

      {/* Universities */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold">Подборка университетов</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Под твой профиль и major Computer Science
            </p>
          </div>
          <button className="text-xs text-primary hover:underline flex items-center gap-1">
            Все вузы <ArrowUpRight className="h-3 w-3" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground border-b border-border">
                <th className="font-medium py-2.5">Университет</th>
                <th className="font-medium">Страна</th>
                <th className="font-medium">Тип</th>
                <th className="font-medium">Шанс</th>
                <th className="font-medium">Дедлайн</th>
              </tr>
            </thead>
            <tbody>
              {universities.map((u) => (
                <tr key={u.name} className="border-b border-border last:border-0 hover:bg-muted/40">
                  <td className="py-3 font-medium">{u.name}</td>
                  <td className="text-muted-foreground">{u.country}</td>
                  <td>
                    <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${tierStyle[u.tier]}`}>
                      {u.tier}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2 w-32">
                      <div className="h-1.5 flex-1 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${u.chance}%`, background: "var(--gradient-brand)" }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-8">{u.chance}%</span>
                    </div>
                  </td>
                  <td className="text-muted-foreground">{u.deadline}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
