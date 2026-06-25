import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  MapPin, School, GraduationCap, Globe2, Target,
  Trophy, Award, Sparkles, FileText, Upload,
  Pencil, Plus, Download, ArrowRight, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LEVEL_META } from "@/lib/target-unis";
import { api } from "@/lib/api";
import { formatAcceptance, type MyListItem } from "@/lib/types";

export const Route = createFileRoute("/_app/portfolio")({
  component: ProfilePage,
});

const awards = [
  { title: "Республиканская олимпиада по информатике", place: "Золото",  year: "2025", level: "Национальный" },
  { title: "IZhO — Жаутыков",                         place: "Серебро", year: "2024", level: "Международный" },
  { title: "Kangaroo Math",                            place: "1 место в регионе", year: "2024", level: "Региональный" },
  { title: "Hackathon nFactorial",                     place: "Финалист", year: "2024", level: "Национальный" },
];

const extracurriculars = [
  { title: "Президент Robotics Club",               hours: "8 ч/нед",  years: "10–12", desc: "Команда из 14 человек, 2 победы на республиканских соревнованиях." },
  { title: "Research Intern, Nazarbayev University", hours: "10 ч/нед", years: "11–12", desc: "ML-модель для предсказания качества воздуха в Алматы." },
  { title: "Волонтёр, фонд Дара",                   hours: "4 ч/нед",  years: "9–12",  desc: "Преподавание программирования детям из детских домов." },
  { title: "Капитан школьной команды по дебатам",   hours: "5 ч/нед",  years: "10–12", desc: "Финал республиканского чемпионата 2024." },
];

const documents = [
  { name: "CV_Alisher_2025.pdf",               type: "CV",            size: "182 КБ", updated: "5 дн назад" },
  { name: "Personal_Statement_v3.docx",         type: "Эссе",          size: "46 КБ",  updated: "вчера" },
  { name: "MIT_Why_Essay.docx",                 type: "Эссе",          size: "28 КБ",  updated: "3 дн назад" },
  { name: "Recommendation_Math_Teacher.pdf",    type: "Рекомендация",  size: "210 КБ", updated: "2 нед назад" },
];

function ProfilePage() {
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: () => api.profile.get(),
    retry: false,
  });

  const { data: myList = [], isLoading: listLoading } = useQuery({
    queryKey: ["my-list"],
    queryFn: () => api.universities.myList(),
  });

  const name = profile?.full_name ?? "Алишер Нуржанов";
  const initials = name.split(" ").map((p: string) => p[0]).join("").slice(0, 2).toUpperCase();

  const scores = [
    { label: "SAT",   value: profile?.sat_total ? String(profile.sat_total) : "—",  sub: profile?.sat_math ? `Math ${profile.sat_math} · EBRW ${profile.sat_ebrw}` : "не указан",       tone: profile?.sat_total ? "emerald" : "muted" },
    { label: "IELTS", value: profile?.ielts ? String(profile.ielts) : "—",          sub: "языковой тест",   tone: profile?.ielts ? "emerald" : "muted" },
    { label: "GPA",   value: profile?.gpa ? `${profile.gpa}/${profile.gpa_scale ?? 4}` : "—",  sub: "средний балл", tone: profile?.gpa ? "emerald" : "muted" },
    { label: "TOEFL", value: profile?.toefl ? String(profile.toefl) : "—",         sub: "не сдавал",       tone: profile?.toefl ? "emerald" : "muted" },
  ];

  const targetCountries = myList.length > 0
    ? Array.from(new Set(myList.map((item: MyListItem) => item.universities?.country).filter(Boolean)))
    : (profile?.target_countries ?? []);

  if (profileLoading || listLoading) {
    return (
      <div className="flex items-center justify-center py-32 gap-3 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" /> Загружаем профиль…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <section
        className="relative overflow-hidden rounded-[32px] p-8 lg:p-10 text-white shadow-2xl"
        style={{ background: "linear-gradient(135deg, #0F3269 0%, #1A4D9C 100%)" }}
      >
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            <div
              className="h-24 w-24 rounded-3xl grid place-items-center text-3xl font-extrabold shadow-2xl shrink-0"
              style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.2)" }}
            >
              {initials}
            </div>
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
                <Sparkles className="h-3 w-3 text-amber-400" /> ПРОФИЛЬ УЧЕНИКА
              </div>
              <h1 className="font-display text-3xl lg:text-4xl font-extrabold leading-tight">{name}</h1>
              <div className="mt-4 flex flex-wrap justify-center sm:justify-start gap-x-6 gap-y-2 text-sm font-medium text-blue-100/70">
                {profile?.school && <span className="inline-flex items-center gap-2"><School className="h-4 w-4" />{profile.school}</span>}
                {profile?.grade  && <span className="inline-flex items-center gap-2"><GraduationCap className="h-4 w-4" />{profile.grade} класс</span>}
                {profile?.city   && <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4" />{profile.city}</span>}
              </div>
            </div>
          </div>
          <div className="flex gap-3 self-center lg:self-end">
            <Button variant="secondary" className="h-11 px-6 rounded-xl bg-white/10 hover:bg-white/20 text-white border-white/10 font-bold">
              <Pencil className="mr-2 h-4 w-4" /> Редактировать
            </Button>
            <Button variant="secondary" className="h-11 px-6 rounded-xl bg-white text-[#0F3269] hover:bg-blue-50 font-bold shadow-lg">
              <Download className="mr-2 h-4 w-4" /> Экспорт CV
            </Button>
          </div>
        </div>
      </section>

      {/* Direction + Countries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Направление" icon={Target}>
          <div className="text-xs text-muted-foreground mb-1.5">Основной мейджор</div>
          <div className="text-lg font-semibold mb-4">{profile?.major ?? "—"}</div>
          <div className="text-xs text-muted-foreground mb-1.5">Активности / Награды</div>
          <div className="flex gap-3">
            <span className="rounded-lg bg-muted/40 px-3 py-2 text-sm">{profile?.activities_count ?? 0} активностей</span>
            <span className="rounded-lg bg-muted/40 px-3 py-2 text-sm">{profile?.awards_count ?? 0} наград</span>
          </div>
        </Card>

        <Card title="Целевые страны" icon={Globe2}>
          <div className="flex flex-wrap gap-2">
            {targetCountries.length > 0
              ? targetCountries.map((c) => (
                  <div key={c as string} className="inline-flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm">
                    <Globe2 className="h-3.5 w-3.5 text-primary" />{c as string}
                  </div>
                ))
              : <p className="text-sm text-muted-foreground">Добавь вузы — страны появятся здесь</p>
            }
          </div>
          {myList.length > 0 && (
            <div className="text-[11px] text-muted-foreground mt-3">Сформировано из выбранных университетов</div>
          )}
        </Card>
      </div>

      {/* Target universities from backend */}
      <Card title="Целевые университеты" icon={GraduationCap} action="Выбрать ещё" actionTo="/universities">
        {myList.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center">
            <GraduationCap className="h-8 w-8 mx-auto text-muted-foreground/60 mb-3" />
            <div className="font-medium text-sm">Пока нет целевых вузов</div>
            <p className="text-xs text-muted-foreground mt-1 mb-4 max-w-sm mx-auto">
              Выбери университеты на странице «Университеты» — они появятся здесь.
            </p>
            <Button asChild size="sm">
              <Link to="/universities">Перейти к выбору <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {myList.map((item: MyListItem) => {
              const u = item.universities;
              const cat = (item.category ?? "match") as keyof typeof LEVEL_META;
              const meta = LEVEL_META[cat];
              return (
                <div key={item.id} className="rounded-xl border border-border p-4 hover:border-primary/40 transition-all">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <div className="font-medium text-sm truncate">{u?.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5 inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {u?.country}
                      </div>
                    </div>
                    <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-md border ${meta.tone}`}>
                      {meta.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-2">
                    <span>Прием {formatAcceptance(u?.acceptance_rate ?? null)}</span>
                    {u?.sat_75th && <><span>·</span><span>SAT 75% {u.sat_75th}</span></>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Scores */}
      <Card title="Академические показатели" icon={Sparkles}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {scores.map((s) => (
            <div key={s.label} className="rounded-xl border border-border p-4 hover:border-primary/40 transition-all">
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
            <div key={a.title} className="flex items-start justify-between gap-4 rounded-xl border border-border p-4 hover:border-primary/40 transition-all">
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
            <div key={e.title} className="rounded-xl border border-border p-4 hover:border-primary/40 transition-all">
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
            <div key={d.name} className="flex items-center justify-between gap-4 rounded-xl border border-border p-3.5 hover:border-primary/40 transition-all">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-9 w-9 rounded-lg grid place-items-center bg-primary/10 text-primary shrink-0">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{d.name}</div>
                  <div className="text-xs text-muted-foreground">{d.type} · {d.size} · {d.updated}</div>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="shrink-0"><Download className="h-4 w-4" /></Button>
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
  title, icon: Icon, action, actionTo, children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  action?: string;
  actionTo?: string;
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
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary" asChild={!!actionTo}>
            {actionTo
              ? <Link to={actionTo}><Plus className="h-4 w-4" /> {action}</Link>
              : <><Plus className="h-4 w-4" /> {action}</>
            }
          </Button>
        )}
      </div>
      {children}
    </section>
  );
}
