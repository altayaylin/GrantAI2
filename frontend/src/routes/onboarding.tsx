import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ArrowRight, Check, ChevronDown, GraduationCap, Globe2, Sparkles, Loader2, X,
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { api } from "@/lib/api";
import type { Profile } from "@/lib/types";
import { toast } from "sonner";

export const Route = createFileRoute("/onboarding")({
  component: OnboardingPage,
});

const MAJORS = [
  "Computer Science", "Engineering", "Business", "Economics", "Mathematics",
  "Physics", "Biology", "Medicine", "Law", "Political Science",
  "International Relations", "Psychology", "Architecture", "Design Science",
];

const GRADES = [9, 10, 11, 12];

const STEPS = ["О тебе", "Направление и страны", "Баллы (по желанию)"];

function clampNumber(raw: string, min: number, max: number): string {
  if (raw.trim() === "") return raw;
  const n = Number(raw);
  if (Number.isNaN(n)) return raw;
  return String(Math.min(max, Math.max(min, n)));
}

function OnboardingPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [step, setStep] = useState(0);

  const [fullName, setFullName] = useState("");
  const [school, setSchool] = useState("");
  const [grade, setGrade] = useState<number | null>(null);

  const [major, setMajor] = useState("");
  const [customMajor, setCustomMajor] = useState("");
  const [majorOpen, setMajorOpen] = useState(false);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [countriesOpen, setCountriesOpen] = useState(false);

  const [gpa, setGpa] = useState("");
  const [gpaScale, setGpaScale] = useState("4");
  const [satTotal, setSatTotal] = useState("");
  const [ielts, setIelts] = useState("");
  const [toefl, setToefl] = useState("");

  const gpaMax = Number(gpaScale) || 4;

  const { data: existingProfile } = useQuery({
    queryKey: ["profile"],
    queryFn: () => api.profile.get(),
    retry: false,
  });

  const { data: universities = [] } = useQuery({
    queryKey: ["universities"],
    queryFn: () => api.universities.list(),
    staleTime: 5 * 60 * 1000,
  });

  const countryOptions = useMemo(
    () => Array.from(new Set(universities.map((u) => u.country))).sort(),
    [universities],
  );

  // Prefill from an existing profile (opened via "Редактировать")
  useEffect(() => {
    if (!existingProfile) return;
    if (existingProfile.full_name) setFullName(existingProfile.full_name);
    if (existingProfile.school) setSchool(existingProfile.school);
    if (existingProfile.grade) setGrade(existingProfile.grade);
    if (existingProfile.major) {
      setMajor(MAJORS.includes(existingProfile.major) ? existingProfile.major : "Другое");
      if (!MAJORS.includes(existingProfile.major)) setCustomMajor(existingProfile.major);
    }
    if (existingProfile.target_countries) setSelectedCountries(existingProfile.target_countries);
    if (existingProfile.gpa != null) setGpa(String(existingProfile.gpa));
    if (existingProfile.gpa_scale) setGpaScale(String(existingProfile.gpa_scale));
    if (existingProfile.sat_total != null) setSatTotal(String(existingProfile.sat_total));
    if (existingProfile.ielts != null) setIelts(String(existingProfile.ielts));
    if (existingProfile.toefl != null) setToefl(String(existingProfile.toefl));
  }, [existingProfile]);

  const saveMutation = useMutation({
    mutationFn: (data: Partial<Profile>) => api.profile.save(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }),
  });

  function toggleCountry(c: string) {
    setSelectedCountries((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c],
    );
  }

  function buildPayload(): Partial<Profile> {
    const resolvedMajor = major === "Другое" ? customMajor.trim() : major;
    return {
      full_name: fullName.trim() || undefined,
      school: school.trim() || undefined,
      grade: grade ?? undefined,
      major: resolvedMajor || undefined,
      target_countries: selectedCountries.length ? selectedCountries : undefined,
      gpa: gpa ? Number(clampNumber(gpa, 0, gpaMax)) : undefined,
      gpa_scale: gpaScale ? Number(gpaScale) : undefined,
      sat_total: satTotal ? Number(clampNumber(satTotal, 400, 1600)) : undefined,
      ielts: ielts ? Number(clampNumber(ielts, 0, 9)) : undefined,
      toefl: toefl ? Number(toefl) : undefined,
    };
  }

  async function handleFinish() {
    try {
      await saveMutation.mutateAsync(buildPayload());
      toast.success("Профиль сохранён!");
      navigate({ to: "/dashboard" });
    } catch {
      toast.error("Не удалось сохранить профиль");
    }
  }

  async function handleSkip() {
    try {
      await saveMutation.mutateAsync(buildPayload());
    } catch {
      // ignore — onboarding is optional, don't block navigation
    }
    navigate({ to: "/dashboard" });
  }

  const isLastStep = step === STEPS.length - 1;
  const majorLabel = major === "Другое" ? customMajor.trim() || "Другое" : major;

  return (
    <div className="landing-theme min-h-screen flex flex-col justify-between py-8 px-4 relative overflow-hidden">
      <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-[rgba(79,142,247,0.1)] to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-150px] left-[-150px] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-[rgba(123,110,246,0.08)] to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-3xl mx-auto w-full px-4 mb-4 flex items-center justify-between">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Перейти в кабинет
        </Link>
        <button
          onClick={handleSkip}
          disabled={saveMutation.isPending}
          className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          Пропустить
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center my-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-2xl rounded-2xl border border-[var(--border)] bg-[var(--bg-card)]/80 backdrop-blur-xl p-8 shadow-2xl relative overflow-hidden"
        >
          <div className="flex flex-col items-center text-center mb-6">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--accent-glow)] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">
              <Sparkles className="h-3 w-3" /> Настройка профиля
            </div>
            <h2 className="text-2xl font-bold font-display text-[var(--text-primary)]">
              Пара вопросов — и AI подберёт вузы
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-2 max-w-md">
              Всё, кроме направления и стран, можно оставить пустым и заполнить позже в профиле.
            </p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {STEPS.map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <div
                  className={`h-7 w-7 rounded-full grid place-items-center text-xs font-bold border transition-colors ${
                    i === step
                      ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                      : i < step
                      ? "bg-[var(--accent-glow)] text-[var(--accent)] border-[var(--accent)]/40"
                      : "bg-transparent text-[var(--text-muted)] border-[var(--border)]"
                  }`}
                >
                  {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`h-px w-10 ${i < step ? "bg-[var(--accent)]/40" : "bg-[var(--border)]"}`} />
                )}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.2 }}
              className="space-y-5"
            >
              {step === 0 && (
                <>
                  <Field label="Имя и фамилия">
                    <input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Алишер Нуржанов"
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Школа / учебное заведение">
                    <input
                      value={school}
                      onChange={(e) => setSchool(e.target.value)}
                      placeholder="НИШ ФМН Алматы"
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Класс">
                    <div className="flex flex-wrap gap-2">
                      {GRADES.map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setGrade(g)}
                          className={chipClass(grade === g)}
                        >
                          {grade === g && <Check className="h-3 w-3" />}
                          {g} класс
                        </button>
                      ))}
                    </div>
                  </Field>
                </>
              )}

              {step === 1 && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                      <GraduationCap className="inline h-3.5 w-3.5 mr-1.5 -mt-0.5" />
                      Основной мейджор
                    </label>
                    <Collapsible open={majorOpen} onOpenChange={setMajorOpen}>
                      <CollapsibleTrigger asChild>
                        <button type="button" className={triggerClass}>
                          <span className={major ? "" : "text-[var(--text-muted)]"}>
                            {major ? majorLabel : "Выбери направление"}
                          </span>
                          <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${majorOpen ? "rotate-180" : ""}`} />
                        </button>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="mt-2 flex flex-wrap gap-2 p-3 rounded-xl border border-[var(--border)] bg-[var(--bg-base)]/30">
                          {MAJORS.map((m) => (
                            <button
                              key={m}
                              type="button"
                              onClick={() => {
                                setMajor(m);
                                setMajorOpen(false);
                              }}
                              className={chipClass(major === m)}
                            >
                              {major === m && <Check className="h-3 w-3" />}
                              {m}
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={() => setMajor("Другое")}
                            className={chipClass(major === "Другое")}
                          >
                            {major === "Другое" && <Check className="h-3 w-3" />}
                            Другое
                          </button>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                    {major === "Другое" && (
                      <input
                        value={customMajor}
                        onChange={(e) => setCustomMajor(e.target.value)}
                        placeholder="Укажи свой мейджор"
                        className="mt-3 w-full h-11 px-4 rounded-xl bg-[var(--bg-base)]/50 border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                      <Globe2 className="inline h-3.5 w-3.5 mr-1.5 -mt-0.5" />
                      Целевые страны
                    </label>

                    {selectedCountries.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {selectedCountries.map((c) => (
                          <span
                            key={c}
                            className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-md bg-[var(--accent-glow)] text-[var(--accent)] text-xs font-medium"
                          >
                            {c}
                            <button
                              type="button"
                              onClick={() => toggleCountry(c)}
                              className="hover:text-[var(--text-primary)] transition-colors"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    <Collapsible open={countriesOpen} onOpenChange={setCountriesOpen}>
                      <CollapsibleTrigger asChild>
                        <button type="button" className={triggerClass}>
                          <span className={selectedCountries.length ? "" : "text-[var(--text-muted)]"}>
                            {selectedCountries.length ? `Выбрано стран: ${selectedCountries.length}` : "Выбери страны"}
                          </span>
                          <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${countriesOpen ? "rotate-180" : ""}`} />
                        </button>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="mt-2 flex flex-wrap gap-2 p-3 rounded-xl border border-[var(--border)] bg-[var(--bg-base)]/30 max-h-56 overflow-y-auto">
                          {countryOptions.map((c) => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => toggleCountry(c)}
                              className={chipClass(selectedCountries.includes(c))}
                            >
                              {selectedCountries.includes(c) && <Check className="h-3 w-3" />}
                              {c}
                            </button>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                </>
              )}

              {step === 2 && (
                <div className="grid grid-cols-2 gap-4">
                  <Field label={`GPA (0–${gpaMax})`}>
                    <input
                      type="number" step="0.01" min="0" max={gpaMax} value={gpa}
                      onChange={(e) => setGpa(e.target.value)}
                      onBlur={() => setGpa((v) => clampNumber(v, 0, gpaMax))}
                      placeholder={`До ${gpaMax}`}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Шкала GPA">
                    <select
                      value={gpaScale}
                      onChange={(e) => {
                        const scale = e.target.value;
                        setGpaScale(scale);
                        setGpa((v) => clampNumber(v, 0, Number(scale)));
                      }}
                      className={inputClass}
                    >
                      <option value="4">4.0</option>
                      <option value="5">5.0</option>
                      <option value="10">10.0</option>
                      <option value="100">100</option>
                    </select>
                  </Field>
                  <Field label="SAT (400–1600)">
                    <input
                      type="number" step="10" min="400" max="1600" value={satTotal}
                      onChange={(e) => setSatTotal(e.target.value)}
                      onBlur={() => setSatTotal((v) => clampNumber(v, 400, 1600))}
                      placeholder="1450"
                      className={inputClass}
                    />
                  </Field>
                  <Field label="IELTS (0–9)">
                    <input
                      type="number" step="0.5" min="0" max="9" value={ielts}
                      onChange={(e) => setIelts(e.target.value)}
                      onBlur={() => setIelts((v) => clampNumber(v, 0, 9))}
                      placeholder="7.0"
                      className={inputClass}
                    />
                  </Field>
                  <Field label="TOEFL (0–120)">
                    <input
                      type="number" min="0" max="120" value={toefl}
                      onChange={(e) => setToefl(e.target.value)}
                      onBlur={() => setToefl((v) => clampNumber(v, 0, 120))}
                      placeholder="100"
                      className={inputClass}
                    />
                  </Field>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-between mt-8">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-0"
            >
              Назад
            </button>

            <div className="flex items-center gap-3">
              {isLastStep && (
                <button
                  type="button"
                  onClick={handleSkip}
                  disabled={saveMutation.isPending}
                  className="h-11 px-5 text-sm font-semibold rounded-xl border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent)]/40 transition-colors disabled:opacity-50"
                >
                  Добавить позже
                </button>
              )}
              {isLastStep ? (
                <button
                  type="button"
                  onClick={handleFinish}
                  disabled={saveMutation.isPending}
                  className="h-11 px-6 bg-[var(--accent)] text-white text-sm font-semibold rounded-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_0_24px_rgba(79,142,247,0.4)] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Готово <Check className="h-4 w-4" /></>}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
                  className="h-11 px-6 bg-[var(--accent)] text-white text-sm font-semibold rounded-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_0_24px_rgba(79,142,247,0.4)] active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  Далее <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto w-full text-center text-xs text-[var(--text-muted)] mt-8">
        © {new Date().getFullYear()} GrantAI. Все права защищены.
      </div>
    </div>
  );
}

const inputClass =
  "w-full h-11 px-4 rounded-xl bg-[var(--bg-base)]/50 border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors";

const triggerClass =
  "w-full h-11 px-4 rounded-xl bg-[var(--bg-base)]/50 border border-[var(--border)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors flex items-center justify-between gap-2";

function chipClass(active: boolean) {
  return `px-3 h-9 rounded-lg text-sm border transition-colors inline-flex items-center gap-1.5 ${
    active
      ? "bg-[var(--accent)] text-white border-[var(--accent)]"
      : "bg-[var(--bg-base)]/50 border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)]/40"
  }`;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
        {label}
      </label>
      {children}
    </div>
  );
}
