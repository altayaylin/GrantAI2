import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Plus,
  GraduationCap,
  Trophy,
  FileText,
  CheckCircle2,
  Clock,
  Sparkles,
  Target,
  Building2,
  Calendar,
  Award,
  BookOpen,
  Users,
  Briefcase,
  Heart,
  Star,
  ArrowUpRight,
  Lightbulb,
  BarChart3,
  TrendingUp,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_app/portfolio")({
  component: PortfolioPage,
});

type Status = "done" | "in_progress" | "requested" | "planned";

const statusMap: Record<Status, { label: string; className: string; icon: typeof CheckCircle2 }> = {
  done: {
    label: "Готово",
    className: "bg-emerald-100 text-emerald-700 border-emerald-200",
    icon: CheckCircle2,
  },
  in_progress: {
    label: "В процессе",
    className: "bg-amber-100 text-amber-700 border-amber-200",
    icon: Clock,
  },
  requested: {
    label: "Запрошено",
    className: "bg-blue-100 text-blue-700 border-blue-200",
    icon: Clock,
  },
  planned: {
    label: "Запланировано",
    className: "bg-slate-100 text-slate-600 border-slate-200",
    icon: Calendar,
  },
};

function StatusBadge({ status }: { status: Status }) {
  const s = statusMap[status];
  const Icon = s.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-medium ${s.className}`}
    >
      <Icon className="h-3 w-3" />
      {s.label}
    </span>
  );
}

const tests = [
  { name: "SAT Math", score: 780, max: 800, verified: true },
  { name: "SAT EBRW", score: 720, max: 800, verified: true },
  { name: "IELTS", score: 7.5, max: 9, verified: true },
  { name: "TOEFL", score: null, max: 120, verified: false },
];

const olympiads = [
  { name: "Информатика · Республиканская", place: "Диплом II степени", year: "2025" },
  { name: "Математика · Городская", place: "Победитель", year: "2024" },
  { name: "Физика · Robotex", place: "Финалист", year: "2024" },
];

const activities = [
  {
    role: "Волонтёр-наставник",
    org: "CodeKZ · школа программирования",
    type: "Волонтёрство",
    hours: "6 ч/нед · 1 год",
    impact: "high",
    icon: Heart,
  },
  {
    role: "Стажёр аналитик данных",
    org: "Kaspi Lab",
    type: "Стажировка",
    hours: "20 ч/нед · 3 мес",
    impact: "high",
    icon: Briefcase,
  },
  {
    role: "Капитан команды робототехники",
    org: "NIS Robotics Club",
    type: "Лидерство",
    hours: "8 ч/нед · 2 года",
    impact: "medium",
    icon: Users,
  },
  {
    role: "Автор технического блога",
    org: "Medium · 12 публикаций",
    type: "Личный проект",
    hours: "4 ч/нед · продолжается",
    impact: "medium",
    icon: BookOpen,
  },
];

const documents = [
  { name: "Common App — Personal Statement", note: "Draft 1 · 412 / 650 слов", status: "in_progress" as Status },
  { name: "Recommendation Letter — Physics", note: "Преподаватель: А. К. Жанибеков", status: "requested" as Status },
  { name: "CV / Резюме", note: "Обновлено 2 дня назад", status: "done" as Status },
  { name: "Supplemental Essay — MIT", note: "Не начато", status: "planned" as Status },
];

const initialUnis = [
  { name: "MIT", country: "США", priority: "Reach" },
  { name: "ETH Zürich", country: "Швейцария", priority: "Target" },
  { name: "TU Delft", country: "Нидерланды", priority: "Target" },
];

const strengthCategories = [
  { name: "Academics", value: 92, icon: GraduationCap },
  { name: "Extracurriculars", value: 70, icon: Heart },
  { name: "Essays", value: 45, icon: FileText },
  { name: "Recommendations", value: 60, icon: Users },
];

type Compare = { label: string; you: number; avg: number; display: (n: number) => string };

const uniComparisons: {
  name: string;
  country: string;
  priority: string;
  chance: number;
  verdict: string;
  rows: Compare[];
}[] = [
  {
    name: "MIT",
    country: "США",
    priority: "Reach",
    chance: 18,
    verdict: "Сильная академика, не хватает research-проекта",
    rows: [
      { label: "SAT", you: 1500, avg: 1540, display: (n) => `${n}` },
      { label: "GPA", you: 4.92, avg: 4.95, display: (n) => n.toFixed(2) },
      { label: "Activities", you: 4, avg: 8, display: (n) => `${n}` },
      { label: "Awards", you: 3, avg: 5, display: (n) => `${n}` },
    ],
  },
  {
    name: "ETH Zürich",
    country: "Швейцария",
    priority: "Target",
    chance: 42,
    verdict: "Дотягиваешь по профилю, усиль олимпиады по математике",
    rows: [
      { label: "SAT", you: 1500, avg: 1480, display: (n) => `${n}` },
      { label: "GPA", you: 4.92, avg: 4.8, display: (n) => n.toFixed(2) },
      { label: "Activities", you: 4, avg: 5, display: (n) => `${n}` },
      { label: "Awards", you: 3, avg: 4, display: (n) => `${n}` },
    ],
  },
  {
    name: "TU Delft",
    country: "Нидерланды",
    priority: "Target",
    chance: 64,
    verdict: "Сильный кандидат — сфокусируйся на мотивационном письме",
    rows: [
      { label: "SAT", you: 1500, avg: 1420, display: (n) => `${n}` },
      { label: "GPA", you: 4.92, avg: 4.6, display: (n) => n.toFixed(2) },
      { label: "Activities", you: 4, avg: 4, display: (n) => `${n}` },
      { label: "Awards", you: 3, avg: 2, display: (n) => `${n}` },
    ],
  },
];

function impactColor(impact: string) {
  if (impact === "high") return "bg-[color:var(--brand-100)] text-[color:var(--brand-500)]";
  if (impact === "medium") return "bg-secondary text-secondary-foreground";
  return "bg-muted text-muted-foreground";
}

function PortfolioPage() {
  const [unis, setUnis] = useState(initialUnis);
  const [newUni, setNewUni] = useState("");
  const [newPriority, setNewPriority] = useState("Target");

  const addUni = () => {
    if (!newUni.trim()) return;
    setUnis([...unis, { name: newUni, country: "—", priority: newPriority }]);
    setNewUni("");
  };

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Портфолио</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Управляй академикой, активностями и документами в одном месте.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Target className="h-4 w-4" /> Целевые университеты
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Целевые университеты</DialogTitle>
                <DialogDescription>
                  AI использует этот список, чтобы подбирать активности под требования и ценности вузов.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2 max-h-64 overflow-auto">
                {unis.map((u, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <div>
                      <div className="font-medium text-sm">{u.name}</div>
                      <div className="text-xs text-muted-foreground">{u.country}</div>
                    </div>
                    <Badge variant="secondary">{u.priority}</Badge>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 pt-2 border-t border-border">
                <Input
                  placeholder="Например, Stanford"
                  value={newUni}
                  onChange={(e) => setNewUni(e.target.value)}
                />
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value)}
                  className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                >
                  <option>Reach</option>
                  <option>Target</option>
                  <option>Safety</option>
                </select>
                <Button onClick={addUni}>Добавить</Button>
              </div>
            </DialogContent>
          </Dialog>

          <AddItemDialog />
        </div>
      </div>

      {/* Profile Strength Score */}
      <ProfileStrengthCard />

      {/* AI insight banner */}
      <div
        className="rounded-2xl p-5 text-white flex items-center justify-between gap-4 shadow-[var(--shadow-glow)]"
        style={{ background: "var(--gradient-brand)" }}
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white/15 grid place-items-center">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="font-semibold">AI совет по профилю</div>
            <div className="text-sm text-white/85">
              Добавь 1 исследовательский проект по CS — это укрепит подачу в MIT и ETH Zürich.
            </div>
          </div>
        </div>
        <Button variant="secondary" className="bg-white/15 hover:bg-white/25 text-white border-0">
          Открыть план
        </Button>
      </div>

      {/* Top row: Academics */}
      <Section
        icon={GraduationCap}
        title="Академические достижения"
        subtitle="Стандартизированные тесты, GPA и олимпиады"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {/* Tests card */}
          <Card className="xl:col-span-2">
            <CardHeading icon={Award} title="Стандартизированные тесты" />
            <div className="space-y-3">
              {tests.map((t) => {
                const pct = t.score ? Math.round((Number(t.score) / t.max) * 100) : 0;
                return (
                  <div key={t.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{t.name}</span>
                        {t.verified && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                            <CheckCircle2 className="h-3 w-3" /> verified
                          </span>
                        )}
                      </div>
                      <span className="text-muted-foreground">
                        {t.score ? `${t.score} / ${t.max}` : "Не сдан"}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${pct}%`,
                          background: "var(--gradient-brand)",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* GPA card */}
          <Card>
            <CardHeading icon={TrendingUp} title="GPA / Средний балл" />
            <div className="flex items-end gap-3">
              <div className="text-4xl font-semibold tracking-tight">4.92</div>
              <div className="text-sm text-muted-foreground pb-1.5">/ 5.0</div>
            </div>
            <div className="mt-3 text-xs text-muted-foreground">
              Топ 3% класса · 11 класс
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <MiniStat label="Математика" value="5.0" />
              <MiniStat label="Физика" value="4.9" />
              <MiniStat label="CS" value="5.0" />
            </div>
          </Card>

          {/* Olympiads */}
          <Card className="xl:col-span-3">
            <CardHeading icon={Trophy} title="Олимпиады и конкурсы" />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {olympiads.map((o) => (
                <div
                  key={o.name}
                  className="rounded-xl border border-border p-4 hover:border-primary/40 hover:shadow-[var(--shadow-soft)] transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between">
                    <div
                      className="h-9 w-9 rounded-lg grid place-items-center text-white"
                      style={{ background: "var(--gradient-brand)" }}
                    >
                      <Trophy className="h-4 w-4" />
                    </div>
                    <span className="text-[11px] text-muted-foreground">{o.year}</span>
                  </div>
                  <div className="mt-3 text-sm font-medium">{o.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{o.place}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </Section>

      {/* Two-column: Extracurriculars + Documents */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <Section
            icon={Heart}
            title="Внеучебная деятельность"
            subtitle="Активности, лидерство и проекты"
          >
            <div className="relative">
              <div className="absolute left-[19px] top-2 bottom-2 w-px bg-border" />
              <div className="space-y-3">
                {activities.map((a, i) => {
                  const Icon = a.icon;
                  return (
                    <div
                      key={i}
                      className="relative pl-12 group"
                    >
                      <div
                        className="absolute left-0 top-3 h-10 w-10 rounded-xl grid place-items-center text-white shadow-[var(--shadow-soft)]"
                        style={{ background: "var(--gradient-brand)" }}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="rounded-xl border border-border bg-card p-4 hover:border-primary/40 hover:shadow-[var(--shadow-soft)] transition-all">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <div className="font-medium text-sm">{a.role}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {a.org}
                            </div>
                          </div>
                          <span
                            className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${impactColor(a.impact)}`}
                          >
                            {a.impact === "high" ? "Высокий impact" : "Средний impact"}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-3 text-[11px]">
                          <Badge variant="outline">{a.type}</Badge>
                          <span className="text-muted-foreground inline-flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {a.hours}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Section>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Section
            icon={FileText}
            title="Документы и эссе"
            subtitle="Файлы, черновики, рекомендации"
          >
            <div className="space-y-2.5">
              {documents.map((d) => (
                <div
                  key={d.name}
                  className="rounded-xl border border-border p-3.5 hover:border-primary/40 hover:bg-muted/40 transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="h-9 w-9 rounded-lg bg-secondary grid place-items-center shrink-0">
                        <FileText className="h-4 w-4 text-secondary-foreground" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{d.name}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{d.note}</div>
                      </div>
                    </div>
                    <StatusBadge status={d.status} />
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Target universities mini-card */}
          <Section
            icon={Building2}
            title="Целевые университеты"
            subtitle="AI учитывает их при подборе активностей"
          >
            <div className="space-y-2">
              {unis.map((u, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5 hover:border-primary/40 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Star className="h-4 w-4 text-primary" />
                    <div>
                      <div className="text-sm font-medium">{u.name}</div>
                      <div className="text-[11px] text-muted-foreground">{u.country}</div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">
                    {u.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}

/* --- Reusable bits --- */

function Section({
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  icon: typeof GraduationCap;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2.5">
        <div
          className="h-8 w-8 rounded-lg grid place-items-center text-white"
          style={{ background: "var(--gradient-deep)" }}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-base font-semibold leading-tight">{title}</h2>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>
      {children}
    </section>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-border bg-card p-5 hover:shadow-[var(--shadow-soft)] transition-shadow ${className}`}
    >
      {children}
    </div>
  );
}

function CardHeading({ icon: Icon, title }: { icon: typeof Award; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon className="h-4 w-4 text-primary" />
      <h3 className="text-sm font-semibold">{title}</h3>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/60 py-2">
      <div className="text-sm font-semibold">{value}</div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
    </div>
  );
}

function AddItemDialog() {
  const [type, setType] = useState("activity");
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          className="gap-2 text-white border-0 shadow-[var(--shadow-glow)]"
          style={{ background: "var(--gradient-brand)" }}
        >
          <Plus className="h-4 w-4" /> Добавить активность/достижение
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Новая запись в портфолио</DialogTitle>
          <DialogDescription>
            Заполни поля — AI сразу пересчитает оценку профиля.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "activity", label: "Активность", icon: Heart },
              { id: "achievement", label: "Достижение", icon: Trophy },
              { id: "document", label: "Документ", icon: FileText },
            ].map((opt) => {
              const Icon = opt.icon;
              const active = type === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setType(opt.id)}
                  className={`flex flex-col items-center gap-1 rounded-lg border p-3 text-xs transition-all ${
                    active
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {opt.label}
                </button>
              );
            })}
          </div>
          <div className="space-y-2">
            <Label>Название</Label>
            <Input placeholder="Например, Стажировка в Kaspi Lab" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Организация</Label>
              <Input placeholder="Kaspi Lab" />
            </div>
            <div className="space-y-2">
              <Label>Длительность</Label>
              <Input placeholder="3 месяца" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Описание</Label>
            <Textarea placeholder="Что ты делал и какой результат?" rows={3} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline">Отмена</Button>
          <Button
            className="text-white border-0"
            style={{ background: "var(--gradient-brand)" }}
          >
            Сохранить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
