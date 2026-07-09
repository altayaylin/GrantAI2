import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  MapPin, School, GraduationCap, Globe2, Target,
  Sparkles, Pencil, Plus, Download, ArrowRight, Loader2, Check,
  Award, FileText, Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
  DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CountryFlag } from "@/components/shared/CountryFlag";
import { LEVEL_META } from "@/lib/target-unis";
import { api } from "@/lib/api";
import { formatAcceptance, type MyListItem, type Profile, type Achievement } from "@/lib/types";
import { toast } from "sonner";

const MAJORS = [
  "Computer Science", "Engineering", "Business", "Economics", "Mathematics",
  "Physics", "Biology", "Medicine", "Law", "Political Science",
  "International Relations", "Psychology", "Architecture", "Design",
];

const GRADES = [9, 10, 11, 12];

function clampNumber(raw: string, min: number, max: number): string {
  if (raw.trim() === "") return raw;
  const n = Number(raw);
  if (Number.isNaN(n)) return raw;
  return String(Math.min(max, Math.max(min, n)));
}

export const Route = createFileRoute("/_app/profile")({
  component: ProfilePage,
  validateSearch: (search: Record<string, unknown>): { edit?: "countries" } =>
    search.edit === "countries" ? { edit: "countries" } : {},
});

function ProfilePage() {
  const { edit } = Route.useSearch();
  const [editOpen, setEditOpen] = useState(edit === "countries");
  const [editTab, setEditTab] = useState<"basic" | "focus" | "scores">(
    edit === "countries" ? "focus" : "basic",
  );

  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: () => api.profile.get(),
    retry: false,
  });

  const { data: myListData, isLoading: listLoading } = useQuery({
    queryKey: ["my-list"],
    queryFn: () => api.universities.myList(),
  });

  const profile = profileData ?? null;
  const myList: MyListItem[] = myListData ?? [];

  const name = profile?.full_name ?? "Профиль не заполнен";
  const initials = name.split(" ").map((p: string) => p[0]).join("").slice(0, 2).toUpperCase();

  const scores = [
    { label: "SAT",   value: profile?.sat_total ? String(profile.sat_total) : "—",  sub: profile?.sat_math ? `Math ${profile.sat_math} · EBRW ${profile.sat_ebrw}` : "не указан",       tone: profile?.sat_total ? "emerald" : "muted" },
    { label: "IELTS", value: profile?.ielts ? String(profile.ielts) : "—",          sub: "языковой тест",   tone: profile?.ielts ? "emerald" : "muted" },
    { label: "GPA",   value: profile?.gpa ? `${profile.gpa}/${profile.gpa_scale ?? 4}` : "—",  sub: "средний балл", tone: profile?.gpa ? "emerald" : "muted" },
    { label: "TOEFL", value: profile?.toefl ? String(profile.toefl) : "—",         sub: "не сдавал",       tone: profile?.toefl ? "emerald" : "muted" },
  ];

  const targetCountries = profile?.target_countries ?? [];

  if (profileLoading || listLoading) {
    return (
      <div className="flex items-center justify-center py-32 gap-3 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" /> Загружаем профиль…
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-12 text-center">
        <GraduationCap className="h-10 w-10 mx-auto text-muted-foreground/60 mb-4" />
        <div className="font-semibold text-lg">Профиль ещё не заполнен</div>
        <p className="text-sm text-muted-foreground mt-1 mb-5 max-w-sm mx-auto">
          Заполни анкету, чтобы мы могли подобрать университеты и показать твою статистику здесь.
        </p>
        <Button onClick={() => { setEditTab("basic"); setEditOpen(true); }}>
          Заполнить профиль <ArrowRight className="h-4 w-4" />
        </Button>
        <EditProfileDialog profile={null} open={editOpen} onOpenChange={setEditOpen} initialTab={editTab} />
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
            <Button
              variant="secondary"
              className="h-11 px-6 rounded-xl bg-white/10 hover:bg-white/20 text-white border-white/10 font-bold"
              onClick={() => { setEditTab("basic"); setEditOpen(true); }}
            >
              <Pencil className="mr-2 h-4 w-4" /> Редактировать
            </Button>
            <Button variant="secondary" className="h-11 px-6 rounded-xl bg-white text-[#0F3269] hover:bg-blue-50 font-bold shadow-lg">
              <Download className="mr-2 h-4 w-4" /> Экспорт CV
            </Button>
          </div>
        </div>
      </section>

      <EditProfileDialog profile={profile} open={editOpen} onOpenChange={setEditOpen} initialTab={editTab} />

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
                  <div key={c} className="inline-flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm">
                    <CountryFlag country={c} className="h-3.5 w-5" />{c}
                  </div>
                ))
              : <p className="text-sm text-muted-foreground">Выбери страны в профиле — они появятся здесь</p>
            }
          </div>
        </Card>
      </div>

      <AchievementsCard />

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
    </div>
  );
}

function EditProfileDialog({
  profile, open, onOpenChange, initialTab = "basic",
}: {
  profile: Profile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTab?: "basic" | "focus" | "scores";
}) {
  const qc = useQueryClient();

  const [tab, setTab] = useState(initialTab);
  const [fullName, setFullName] = useState("");
  const [school, setSchool] = useState("");
  const [city, setCity] = useState("");
  const [grade, setGrade] = useState<number | null>(null);
  const [major, setMajor] = useState("");
  const [customMajor, setCustomMajor] = useState("");
  const [countries, setCountries] = useState<string[]>([]);
  const [gpa, setGpa] = useState("");
  const [gpaScale, setGpaScale] = useState("4");
  const [satTotal, setSatTotal] = useState("");
  const [satMath, setSatMath] = useState("");
  const [satEbrw, setSatEbrw] = useState("");
  const [ielts, setIelts] = useState("");
  const [toefl, setToefl] = useState("");

  const gpaMax = Number(gpaScale) || 4;

  const { data: universities = [] } = useQuery({
    queryKey: ["universities"],
    queryFn: () => api.universities.list(),
    staleTime: 5 * 60 * 1000,
  });
  const countryOptions = useMemo(
    () => Array.from(new Set(universities.map((u) => u.country))).sort(),
    [universities],
  );

  // Reset the form to the current profile every time the dialog opens
  useEffect(() => {
    if (!open) return;
    setTab(initialTab);
    setFullName(profile?.full_name ?? "");
    setSchool(profile?.school ?? "");
    setCity(profile?.city ?? "");
    setGrade(profile?.grade ?? null);
    const m = profile?.major ?? "";
    setMajor(m && !MAJORS.includes(m) ? "Другое" : m);
    setCustomMajor(m && !MAJORS.includes(m) ? m : "");
    setCountries(profile?.target_countries ?? []);
    setGpa(profile?.gpa != null ? String(profile.gpa) : "");
    setGpaScale(profile?.gpa_scale ? String(profile.gpa_scale) : "4");
    setSatTotal(profile?.sat_total != null ? String(profile.sat_total) : "");
    setSatMath(profile?.sat_math != null ? String(profile.sat_math) : "");
    setSatEbrw(profile?.sat_ebrw != null ? String(profile.sat_ebrw) : "");
    setIelts(profile?.ielts != null ? String(profile.ielts) : "");
    setToefl(profile?.toefl != null ? String(profile.toefl) : "");
  }, [open, profile, initialTab]);

  function toggleCountry(c: string) {
    setCountries((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  }

  const saveMutation = useMutation({
    mutationFn: (data: Partial<Profile>) => api.profile.save(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Профиль обновлён");
      onOpenChange(false);
    },
    onError: () => toast.error("Не удалось сохранить профиль"),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const resolvedMajor = major === "Другое" ? customMajor.trim() : major;
    saveMutation.mutate({
      full_name: fullName.trim() || undefined,
      school: school.trim() || undefined,
      city: city.trim() || undefined,
      grade: grade ?? undefined,
      major: resolvedMajor || undefined,
      target_countries: countries.length ? countries : undefined,
      gpa: gpa ? Number(clampNumber(gpa, 0, gpaMax)) : undefined,
      gpa_scale: gpaScale ? Number(gpaScale) : undefined,
      sat_total: satTotal ? Number(clampNumber(satTotal, 400, 1600)) : undefined,
      sat_math: satMath ? Number(clampNumber(satMath, 200, 800)) : undefined,
      sat_ebrw: satEbrw ? Number(clampNumber(satEbrw, 200, 800)) : undefined,
      ielts: ielts ? Number(clampNumber(ielts, 0, 9)) : undefined,
      toefl: toefl ? Number(clampNumber(toefl, 0, 120)) : undefined,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden gap-0 p-0 [&>button]:z-20 [&>button]:rounded-full [&>button]:text-white [&>button]:opacity-80 [&>button]:hover:bg-white/10 [&>button]:hover:opacity-100">
        <div
          className="relative overflow-hidden px-6 py-6 text-white shrink-0"
          style={{ background: "linear-gradient(135deg, #0F3269 0%, #1A4D9C 100%)" }}
        >
          <div className="absolute -top-12 -right-8 h-36 w-36 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-[#3B82F6]/25 blur-3xl pointer-events-none" />
          <DialogHeader className="relative z-10">
            <div className="flex items-center gap-3.5">
              <div
                className="h-11 w-11 rounded-2xl grid place-items-center shrink-0 shadow-lg"
                style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.2)" }}
              >
                <Pencil className="h-5 w-5" />
              </div>
              <div className="text-left">
                <DialogTitle
                  className="font-display text-xl font-extrabold text-white tracking-tight"
                  style={{ textShadow: "0 1px 0 rgba(255,255,255,0.25), 0 2px 6px rgba(0,0,0,0.35)" }}
                >
                  Редактировать профиль
                </DialogTitle>
                <DialogDescription className="text-blue-100/70 text-xs mt-0.5">
                  Изменения сохранятся сразу и появятся на странице профиля
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col min-h-0">
          <div className="space-y-5 px-6 py-5 overflow-y-auto">
          <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">О тебе</TabsTrigger>
              <TabsTrigger value="focus">Направление</TabsTrigger>
              <TabsTrigger value="scores">Баллы</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 pt-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1.5">
                  <Label htmlFor="ep-name">Имя и фамилия</Label>
                  <Input
                    id="ep-name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Алишер Нуржанов"
                  />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label htmlFor="ep-school">Школа</Label>
                  <Input
                    id="ep-school"
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    placeholder="НИШ ФМН Алматы"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ep-city">Город</Label>
                  <Input
                    id="ep-city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Алматы"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Класс</Label>
                  <Select value={grade ? String(grade) : undefined} onValueChange={(v) => setGrade(Number(v))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выбери класс" />
                    </SelectTrigger>
                    <SelectContent>
                      {GRADES.map((g) => (
                        <SelectItem key={g} value={String(g)}>{g} класс</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="focus" className="space-y-4 pt-3">
              <div className="space-y-1.5">
                <Label>Основной мейджор</Label>
                <Select value={major || undefined} onValueChange={setMajor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выбери направление" />
                  </SelectTrigger>
                  <SelectContent>
                    {MAJORS.map((m) => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                    <SelectItem value="Другое">Другое</SelectItem>
                  </SelectContent>
                </Select>
                {major === "Другое" && (
                  <Input
                    value={customMajor}
                    onChange={(e) => setCustomMajor(e.target.value)}
                    placeholder="Укажи свой мейджор"
                    className="mt-2"
                  />
                )}
              </div>

              <div className="space-y-1.5">
                <Label>Целевые страны</Label>
                <div className="flex flex-wrap gap-2 rounded-xl border border-border p-3 max-h-48 overflow-y-auto">
                  {countryOptions.length === 0 ? (
                    <span className="text-sm text-muted-foreground">Список стран загружается…</span>
                  ) : (
                    countryOptions.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => toggleCountry(c)}
                        className={`px-3 h-9 rounded-lg text-sm border transition-colors inline-flex items-center gap-1.5 ${
                          countries.includes(c)
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-card border-border hover:border-primary/40"
                        }`}
                      >
                        <CountryFlag country={c} className="h-3.5 w-5" />
                        {c}
                        {countries.includes(c) && <Check className="h-3 w-3" />}
                      </button>
                    ))
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="scores" className="space-y-4 pt-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="ep-gpa">{`GPA (0–${gpaMax})`}</Label>
                  <Input
                    id="ep-gpa" type="number" step="0.01" min={0} max={gpaMax} value={gpa}
                    onChange={(e) => setGpa(e.target.value)}
                    onBlur={() => setGpa((v) => clampNumber(v, 0, gpaMax))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Шкала GPA</Label>
                  <Select
                    value={gpaScale}
                    onValueChange={(v) => {
                      setGpaScale(v);
                      setGpa((g) => clampNumber(g, 0, Number(v)));
                    }}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="4">4.0</SelectItem>
                      <SelectItem value="5">5.0</SelectItem>
                      <SelectItem value="10">10.0</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ep-sat">SAT total (400–1600)</Label>
                  <Input
                    id="ep-sat" type="number" step="10" min={400} max={1600} value={satTotal}
                    onChange={(e) => setSatTotal(e.target.value)}
                    onBlur={() => setSatTotal((v) => clampNumber(v, 400, 1600))}
                  />
                </div>
                <div />
                <div className="space-y-1.5">
                  <Label htmlFor="ep-sat-math">SAT Math (200–800)</Label>
                  <Input
                    id="ep-sat-math" type="number" step="10" min={200} max={800} value={satMath}
                    onChange={(e) => setSatMath(e.target.value)}
                    onBlur={() => setSatMath((v) => clampNumber(v, 200, 800))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ep-sat-ebrw">SAT EBRW (200–800)</Label>
                  <Input
                    id="ep-sat-ebrw" type="number" step="10" min={200} max={800} value={satEbrw}
                    onChange={(e) => setSatEbrw(e.target.value)}
                    onBlur={() => setSatEbrw((v) => clampNumber(v, 200, 800))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ep-ielts">IELTS (0–9)</Label>
                  <Input
                    id="ep-ielts" type="number" step="0.5" min={0} max={9} value={ielts}
                    onChange={(e) => setIelts(e.target.value)}
                    onBlur={() => setIelts((v) => clampNumber(v, 0, 9))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ep-toefl">TOEFL (0–120)</Label>
                  <Input
                    id="ep-toefl" type="number" min={0} max={120} value={toefl}
                    onChange={(e) => setToefl(e.target.value)}
                    onBlur={() => setToefl((v) => clampNumber(v, 0, 120))}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
          </div>

          <DialogFooter className="px-6 py-4 border-t border-border shrink-0">
            <DialogClose asChild>
              <Button type="button" variant="ghost">Отмена</Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={saveMutation.isPending}
              className="rounded-xl font-bold text-white border-0 shadow-lg transition-all hover:brightness-110 hover:shadow-[0_0_20px_rgba(59,130,246,0.45)]"
              style={{ background: "linear-gradient(135deg, #1A4D9C 0%, #3B82F6 100%)" }}
            >
              {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Сохранить"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Card({
  title, icon: Icon, action, actionTo, onAction, children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  action?: string;
  actionTo?: string;
  onAction?: () => void;
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
          <Button
            variant="ghost"
            size="sm"
            className="text-primary hover:text-primary"
            asChild={!!actionTo}
            onClick={!actionTo ? onAction : undefined}
          >
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

const ACHIEVEMENT_CATEGORIES: { value: Achievement["category"]; label: string }[] = [
  { value: "activity", label: "Активность" },
  { value: "award", label: "Награда" },
];

function AchievementsCard() {
  const qc = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);

  const { data: achievements = [], isLoading } = useQuery({
    queryKey: ["achievements"],
    queryFn: () => api.achievements.list(),
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => api.achievements.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["achievements"] });
      qc.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: () => toast.error("Не удалось удалить достижение"),
  });

  return (
    <Card title="Достижения и активности" icon={Award} action="Добавить" onAction={() => setAddOpen(true)}>
      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
          <Loader2 className="h-4 w-4 animate-spin" /> Загружаем…
        </div>
      ) : achievements.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center">
          <Award className="h-8 w-8 mx-auto text-muted-foreground/60 mb-3" />
          <div className="font-medium text-sm">Пока нет достижений</div>
          <p className="text-xs text-muted-foreground mt-1 mb-4 max-w-sm mx-auto">
            Добавь активности и награды, приложи файлы (сертификаты, дипломы) — это учитывается при подборе университетов.
          </p>
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4" /> Добавить достижение
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {achievements.map((a) => (
            <div key={a.id} className="rounded-xl border border-border p-4 hover:border-primary/40 transition-all">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <span
                    className={`inline-block text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-md border mb-1.5 ${
                      a.category === "award"
                        ? "text-amber-600 border-amber-200 bg-amber-50"
                        : "text-blue-600 border-blue-200 bg-blue-50"
                    }`}
                  >
                    {a.category === "award" ? "Награда" : "Активность"}
                  </span>
                  <div className="font-medium text-sm truncate">{a.title}</div>
                  {a.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{a.description}</p>
                  )}
                  {a.file_url && (
                    <a
                      href={a.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary mt-2 hover:underline"
                    >
                      <FileText className="h-3 w-3" /> {a.file_name ?? "Файл"}
                    </a>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeMutation.mutate(a.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                  aria-label="Удалить достижение"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <AddAchievementDialog open={addOpen} onOpenChange={setAddOpen} />
    </Card>
  );
}

function AddAchievementDialog({
  open, onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Achievement["category"]>("activity");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (!open) return;
    setTitle("");
    setCategory("activity");
    setDescription("");
    setFile(null);
  }, [open]);

  const createMutation = useMutation({
    mutationFn: async () => {
      let file_url: string | undefined;
      let file_name: string | undefined;
      if (file) {
        const uploaded = await api.achievements.uploadFile(file);
        file_url = uploaded.url;
        file_name = uploaded.name;
      }
      return api.achievements.create({
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        file_url,
        file_name,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["achievements"] });
      qc.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Достижение добавлено");
      onOpenChange(false);
    },
    onError: () => toast.error("Не удалось добавить достижение"),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    createMutation.mutate();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Добавить достижение</DialogTitle>
          <DialogDescription>
            Активность, награда, сертификат или диплом — можно приложить файл
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="ach-title">Название</Label>
            <Input
              id="ach-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Международная олимпиада по физике"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label>Тип</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as Achievement["category"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {ACHIEVEMENT_CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ach-desc">Описание</Label>
            <Textarea
              id="ach-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Коротко опиши, в чём заключалось достижение"
              rows={3}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ach-file">Файл (сертификат, диплом, портфолио)</Label>
            <Input
              id="ach-file"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="ghost">Отмена</Button>
            </DialogClose>
            <Button type="submit" disabled={createMutation.isPending || !title.trim()}>
              {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Добавить"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
