import { createFileRoute, Link } from "@tanstack/react-router";
import {
  MapPin,
  School,
  GraduationCap,
  Globe2,
  Target,
  Trophy,
  Award,
  Sparkles,
  FileText,
  Upload,
  Mail,
  Phone,
  Pencil,
  Plus,
  Download,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UNIVERSITIES, useTargetUnis, LEVEL_META } from "@/lib/target-unis";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_app/portfolio")({
  component: ProfilePage,
});

const student = {
  name: "Алишер Нуржанов",
  school: "НИШ ФМН Алматы",
  grade: "12 класс",
  city: "Алматы, Казахстан",
  email: "alisher.n@nis.edu.kz",
  phone: "+7 (700) 123-45-67",
  major: "Computer Science",
  interests: ["AI / Machine Learning", "Robotics", "Quantitative Finance"],
  countries: ["США", "Великобритания", "Нидерланды", "Швейцария"],
};

const scores = [
  { label: "SAT", value: "1500", sub: "Math 780 · EBRW 720", tone: "emerald" },
  { label: "IELTS", value: "7.5", sub: "L 8.0 · R 7.5 · W 7.0 · S 7.5", tone: "emerald" },
  { label: "GPA", value: "3.92", sub: "по шкале 4.0", tone: "emerald" },
  { label: "TOEFL", value: "—", sub: "не сдавал", tone: "muted" },
];

const awards = [
  { title: "Республиканская олимпиада по информатике", place: "Золото", year: "2025", level: "Национальный" },
  { title: "IZhO — Жаутыков", place: "Серебро", year: "2024", level: "Международный" },
  { title: "Kangaroo Math", place: "1 место в регионе", year: "2024", level: "Региональный" },
  { title: "Hackathon nFactorial", place: "Финалист", year: "2024", level: "Национальный" },
];

const extracurriculars = [
  { title: "Президент Robotics Club", hours: "8 ч/нед", years: "10–12", desc: "Команда из 14 человек, 2 победы на республиканских соревнованиях." },
  { title: "Research Intern, Nazarbayev University", hours: "10 ч/нед", years: "11–12", desc: "ML-модель для предсказания качества воздуха в Алматы." },
  { title: "Волонтёр, фонд Дара", hours: "4 ч/нед", years: "9–12", desc: "Преподавание программирования детям из детских домов." },
  { title: "Капитан школьной команды по дебатам", hours: "5 ч/нед", years: "10–12", desc: "Финал республиканского чемпионата 2024." },
];

const documents = [
  { name: "CV_Alisher_2025.pdf", type: "CV", size: "182 КБ", updated: "5 дн назад" },
  { name: "Personal_Statement_v3.docx", type: "Эссе", size: "46 КБ", updated: "вчера" },
  { name: "MIT_Why_Essay.docx", type: "Эссе", size: "28 КБ", updated: "3 дн назад" },
  { name: "Recommendation_Math_Teacher.pdf", type: "Рекомендация", size: "210 КБ", updated: "2 нед назад" },
];

function ProfilePage() {
  return (
    <div className="space-y-6">
      {/* Header card */}
      <section
        className="rounded-2xl p-6 md:p-8 text-white"
        style={{ background: "var(--gradient-deep)" }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-5">
            <div
              className="h-20 w-20 rounded-2xl grid place-items-center text-2xl font-bold shadow-[var(--shadow-glow)]"
              style={{ background: "var(--gradient-brand)" }}
            >
              АН
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold">{student.name}</h1>
              <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-white/75">
                <span className="inline-flex items-center gap-1.5"><School className="h-3.5 w-3.5" />{student.school}</span>
                <span className="inline-flex items-center gap-1.5"><GraduationCap className="h-3.5 w-3.5" />{student.grade}</span>
                <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{student.city}</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/60">
                <span className="inline-flex items-center gap-1.5"><Mail className="h-3 w-3" />{student.email}</span>
                <span className="inline-flex items-center gap-1.5"><Phone className="h-3 w-3" />{student.phone}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" className="bg-white/15 hover:bg-white/25 text-white border-0">
              <Pencil className="h-4 w-4" /> Редактировать
            </Button>
            <Button variant="secondary" className="bg-white text-foreground hover:bg-white/90">
              <Download className="h-4 w-4" /> Экспорт CV
            </Button>
          </div>
        </div>
      </section>

      {/* Direction */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Направление" icon={Target}>
          <div className="text-xs text-muted-foreground mb-1.5">Основной мейджор</div>
          <div className="text-lg font-semibold mb-4">{student.major}</div>
          <div className="text-xs text-muted-foreground mb-1.5">Сферы интересов</div>
          <div className="flex flex-wrap gap-2">
            {student.interests.map((i) => (
              <Badge key={i} variant="secondary" className="font-normal">{i}</Badge>
            ))}
          </div>
        </Card>

        <Card title="Целевые страны" icon={Globe2}>
          <div className="flex flex-wrap gap-2">
            {student.countries.map((c) => (
              <div
                key={c}
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm"
              >
                <Globe2 className="h-3.5 w-3.5 text-primary" />
                {c}
              </div>
            ))}
            <button className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-border px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:border-primary transition-colors">
              <Plus className="h-3.5 w-3.5" /> Добавить
            </button>
          </div>
        </Card>
      </div>

      {/* Scores */}
      <Card title="Академические показатели" icon={Sparkles}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {scores.map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-border p-4 hover:border-primary/40 hover:shadow-[var(--shadow-soft)] transition-all"
            >
              <div className="text-xs text-muted-foreground">{s.label}</div>
              <div className={`text-2xl font-semibold mt-1 ${s.tone === "muted" ? "text-muted-foreground" : "text-foreground"}`}>
                {s.value}
              </div>
              <div className="text-[11px] text-muted-foreground mt-1">{s.sub}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Awards */}
      <Card title="Олимпиады и награды" icon={Trophy} action="Добавить">
        <div className="space-y-2">
          {awards.map((a) => (
            <div
              key={a.title}
              className="flex items-start justify-between gap-4 rounded-xl border border-border p-4 hover:border-primary/40 hover:shadow-[var(--shadow-soft)] transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-lg grid place-items-center bg-primary/10 text-primary shrink-0">
                  <Award className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-medium text-sm">{a.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{a.place} · {a.year}</div>
                </div>
              </div>
              <Badge variant="outline" className="shrink-0">{a.level}</Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* Extracurriculars */}
      <Card title="Внеучебная деятельность" icon={Sparkles} action="Добавить">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {extracurriculars.map((e) => (
            <div
              key={e.title}
              className="rounded-xl border border-border p-4 hover:border-primary/40 hover:shadow-[var(--shadow-soft)] transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="font-medium text-sm">{e.title}</div>
                <Badge variant="secondary" className="font-normal shrink-0">{e.hours}</Badge>
              </div>
              <div className="text-xs text-muted-foreground mt-1">Классы: {e.years}</div>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{e.desc}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Documents */}
      <Card title="Документы" icon={FileText} action="Загрузить">
        <div className="space-y-2">
          {documents.map((d) => (
            <div
              key={d.name}
              className="flex items-center justify-between gap-4 rounded-xl border border-border p-3.5 hover:border-primary/40 hover:shadow-[var(--shadow-soft)] transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-9 w-9 rounded-lg grid place-items-center bg-primary/10 text-primary shrink-0">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{d.name}</div>
                  <div className="text-xs text-muted-foreground">{d.type} · {d.size} · {d.updated}</div>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="shrink-0">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <button className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-border px-3 py-4 text-sm text-muted-foreground hover:text-foreground hover:border-primary transition-colors">
            <Upload className="h-4 w-4" /> Загрузить документ
          </button>
        </div>
      </Card>
    </div>
  );
}

function Card({
  title,
  icon: Icon,
  action,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  action?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 md:p-6 shadow-[var(--shadow-soft)]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg grid place-items-center bg-primary/10 text-primary">
            <Icon className="h-4 w-4" />
          </div>
          <h2 className="font-semibold">{title}</h2>
        </div>
        {action && (
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary">
            <Plus className="h-4 w-4" /> {action}
          </Button>
        )}
      </div>
      {children}
    </section>
  );
}
