import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ChevronDown,
  Star,
  Bookmark,
  Calendar,
  Clock,
  Globe,
  Briefcase,
  FlaskConical,
  Trophy,
  Heart,
  X,
  FileCheck,
  Sparkles,
  Zap,
  Loader2,
  Check,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import {
  CATEGORY_META,
  whyItFits,
  useFavorites,
  useMyActivities,
  useCreatedDeadlines,
  type Opportunity,
  type OppCategory,
} from "@/lib/opportunities";

export const Route = createFileRoute("/_app/opportunities")({
  component: OpportunitiesPage,
});

const CATEGORY_ICON: Record<OppCategory, any> = {
  internship: Briefcase,
  research: FlaskConical,
  olympiad: Trophy,
  volunteer: Heart,
};

type SortMode = "deadline" | "fit" | "prestige";

function OpportunitiesPage() {
  const qc = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<OppCategory>("internship");
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("");
  const [format, setFormat] = useState("");
  const [cost, setCost] = useState("");
  const [grade, setGrade] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("deadline");

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: () => api.profile.get(),
    retry: false,
  });

  const { data: opportunities = [], isLoading, error } = useQuery({
    queryKey: ["activities"],
    queryFn: () => api.activities.list(),
    staleTime: 5 * 60 * 1000,
  });

  const favorites = useFavorites();
  const mine = useMyActivities();
  const createdDeadlines = useCreatedDeadlines();

  const createDeadlineMutation = useMutation({
    mutationFn: (opp: Opportunity) => {
      if (!opp.deadline) throw new Error("no deadline");
      return api.deadlines.create({
        title: `Подача: ${opp.title}`,
        due_date: opp.deadline,
        category: "Активность",
      });
    },
    onSuccess: (_, opp) => {
      qc.invalidateQueries({ queryKey: ["deadlines"] });
      createdDeadlines.toggle(opp.id);
      toast.success("Дедлайн добавлен — смотри вкладку «Дедлайны»");
    },
    onError: () => toast.error("Не удалось создать дедлайн"),
  });

  const ctx = useMemo(
    () => ({
      interests: profile?.major ? [profile.major] : [],
      targetCountries: profile?.target_countries ?? [],
      grade: profile?.grade ?? 11,
      major: profile?.major ?? "",
    }),
    [profile],
  );

  // Every opportunity scored once against the student's profile — this is the
  // actual "find the right activity" logic: hard facts (grade/country/major)
  // plus a heuristic fit score used for both filtering and the "why it fits" copy.
  const scored = useMemo(
    () => opportunities.map((opp) => ({ opp, fit: whyItFits(opp, ctx) })),
    [opportunities, ctx],
  );

  const categoryItems = useMemo(
    () => scored.filter((s) => s.opp.category === selectedCategory),
    [scored, selectedCategory],
  );

  const countryOptions = useMemo(
    () => Array.from(new Set(categoryItems.map((s) => s.opp.country).filter((c): c is string => !!c))).sort(),
    [categoryItems],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const result = categoryItems.filter(({ opp }) => {
      const matchesQ =
        !q ||
        opp.title.toLowerCase().includes(q) ||
        (opp.org ?? "").toLowerCase().includes(q) ||
        opp.tags.some((t) => t.toLowerCase().includes(q));
      const matchesCountry = !country || opp.country === country;
      const matchesFormat = !format || opp.format === format;
      const matchesCost = !cost || opp.cost === cost;
      const matchesGrade = !grade || opp.grades.includes(Number(grade));
      return matchesQ && matchesCountry && matchesFormat && matchesCost && matchesGrade;
    });

    return [...result].sort((a, b) => {
      if (sortMode === "fit") return b.fit.score - a.fit.score;
      if (sortMode === "prestige") return (b.opp.prestige ?? 0) - (a.opp.prestige ?? 0);
      if (!a.opp.deadline) return 1;
      if (!b.opp.deadline) return -1;
      return new Date(a.opp.deadline).getTime() - new Date(b.opp.deadline).getTime();
    });
  }, [categoryItems, query, country, format, cost, grade, sortMode]);

  const goodMatches = useMemo(() => scored.filter((s) => s.fit.score >= 65).length, [scored]);

  const stats = [
    { label: "ПОДОБРАНО AI", value: String(goodMatches) },
    { label: "В ИЗБРАННОМ", value: String(favorites.list.length) },
    { label: "УЧАСТВУЮ", value: String(mine.list.length) },
    { label: "ЦЕЛЕВЫХ СТРАН", value: profile?.target_countries?.length ? String(profile.target_countries.length) : "—" },
  ];

  const categories: { id: OppCategory; name: string }[] = [
    { id: "internship", name: "Стажировки" },
    { id: "research", name: "Исследования" },
    { id: "olympiad", name: "Олимпиады" },
    { id: "volunteer", name: "Волонтёрство" },
  ];

  function formatDeadline(iso: string | null) {
    if (!iso) return "Уточняется";
    return new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32 gap-3 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" /> Загружаем активности…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-32 gap-3 text-destructive">
        <AlertCircle className="h-5 w-5" /> Ошибка загрузки: бэкенд недоступен.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-20">
      {/* Header Banner */}
      <div
        className="relative overflow-hidden rounded-3xl bg-[#0F3269] p-8 lg:p-12 text-white shadow-2xl"
        style={{ background: "linear-gradient(135deg, #0F3269 0%, #1A4D9C 100%)" }}
      >
        <div className="relative z-10 max-w-2xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm">
            <Sparkles className="h-3 w-3" /> AI подбирает под твой профиль
          </div>
          <h1 className="font-display text-4xl font-extrabold lg:text-5xl">Активности</h1>
          <p className="mt-4 text-base text-blue-100/80 leading-relaxed lg:text-lg">
            Стажировки, research-программы и конкурсы, усиливающие твой профиль под целевые вузы.
            Сохраняй в избранное, добавляй дедлайны и читай AI-разбор «почему подходит».
          </p>

          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {stats.map((stat, i) => (
              <div key={i} className="rounded-2xl bg-white/5 p-4 backdrop-blur-md border border-white/10">
                <div className="text-[10px] font-bold text-blue-200/60 uppercase tracking-widest">{stat.label}</div>
                <div className="mt-1 text-2xl font-extrabold">{stat.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute right-0 top-0 h-full w-1/3 opacity-10 pointer-events-none">
          <Zap className="h-full w-full rotate-12 transform scale-125" />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-3">
        {categories.map((cat) => {
          const meta = CATEGORY_META[cat.id];
          const count = scored.filter((s) => s.opp.category === cat.id).length;
          const Icon = CATEGORY_ICON[cat.id];
          return (
            <button
              key={cat.id}
              onClick={() => meta.available && setSelectedCategory(cat.id)}
              className={`flex items-center gap-2.5 rounded-2xl border px-5 py-3 text-sm font-semibold transition-all duration-200 ${
                selectedCategory === cat.id
                  ? "bg-[#1A4D9C] border-[#1A4D9C] text-white shadow-lg"
                  : "bg-card border-border text-muted-foreground hover:bg-accent"
              } ${!meta.available ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              <Icon className={`h-4 w-4 ${selectedCategory === cat.id ? "text-white" : "text-amber-600"}`} />
              {cat.name} {count > 0 && <span className="opacity-60 font-mono text-[10px]">{count}</span>}
              {!meta.available && <span className="text-[9px] uppercase tracking-tighter opacity-50 ml-1">IN DEV</span>}
            </button>
          );
        })}
      </div>

      {/* Filter Bar */}
      <div className="rounded-3xl border border-border bg-card/50 p-6 backdrop-blur-xl shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-100 text-[#1A4D9C]">
            <Search className="h-3.5 w-3.5 rotate-90" />
          </div>
          <span className="text-sm font-bold text-foreground">Фильтры</span>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Название, организация, тег"
              className="w-full h-12 rounded-2xl bg-background border border-border pl-11 pr-4 text-sm focus:outline-none focus:border-[#1A4D9C] focus:ring-4 focus:ring-blue-100 transition-all font-medium"
            />
          </div>

          <FilterSelect value={country} onChange={setCountry} placeholder="Все страны" options={countryOptions.map((c) => ({ value: c, label: c }))} />
          <FilterSelect
            value={format}
            onChange={setFormat}
            placeholder="Любой формат"
            options={[
              { value: "Онлайн", label: "Онлайн" },
              { value: "Офлайн", label: "Офлайн" },
              { value: "Гибрид", label: "Гибрид" },
            ]}
          />
          <FilterSelect
            value={cost}
            onChange={setCost}
            placeholder="Любая стоимость"
            options={[
              { value: "free", label: "Бесплатно" },
              { value: "stipend", label: "Оплачиваемая" },
              { value: "paid", label: "Платная" },
            ]}
          />
          <FilterSelect
            value={grade}
            onChange={setGrade}
            placeholder="Любой класс"
            options={[9, 10, 11, 12].map((g) => ({ value: String(g), label: `${g} класс` }))}
          />
        </div>

        <div className="mt-8 flex items-center justify-between border-t border-border/50 pt-4">
          <div className="text-xs text-muted-foreground">
            Найдено <strong className="text-foreground">{filtered.length}</strong> из {categoryItems.length}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">Сортировка:</span>
            <FilterSelect
              value={sortMode}
              onChange={(v) => setSortMode(v as SortMode)}
              placeholder="По дедлайну"
              options={[
                { value: "deadline", label: "По дедлайну" },
                { value: "fit", label: "По AI-совпадению" },
                { value: "prestige", label: "По престижу" },
              ]}
              hideClear
            />
          </div>
        </div>
      </div>

      {/* Opportunities Grid */}
      {!CATEGORY_META[selectedCategory].available ? (
        <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-dashed border-border">
          <Trophy className="h-10 w-10 text-muted-foreground/60 mb-4" />
          <h2 className="text-lg font-semibold">Эта категория ещё в разработке</h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-sm">
            Олимпиады и волонтёрство появятся в одном из следующих обновлений.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground text-sm">
          Ничего не найдено — попробуй другой запрос или сбрось фильтры.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {filtered.map(({ opp, fit }) => {
            const isFav = favorites.has(opp.id);
            const isMine = mine.has(opp.id);
            const CatIcon = CATEGORY_ICON[opp.category];
            return (
              <motion.div
                key={opp.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="group relative flex flex-col rounded-3xl border border-border bg-card p-8 shadow-sm transition-all hover:shadow-xl hover:border-blue-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center rounded-lg bg-indigo-100 px-2.5 py-1 text-[10px] font-bold text-indigo-700">
                        <CatIcon className="mr-1 h-3 w-3" /> {CATEGORY_META[opp.category].label.toUpperCase()}
                      </span>
                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-3 w-3 ${i < (opp.prestige ?? 0) ? "fill-current" : "text-gray-200"}`} />
                        ))}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-foreground mt-1 group-hover:text-[#1A4D9C] transition-colors">{opp.title}</h3>
                    <p className="text-sm text-muted-foreground font-medium">{opp.org}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => favorites.toggle(opp.id)}
                      title="В избранное"
                      className={`rounded-xl border p-2 transition-all ${
                        isFav
                          ? "border-amber-400/60 bg-amber-50 text-amber-600"
                          : "border-border text-muted-foreground hover:bg-accent hover:text-foreground"
                      }`}
                    >
                      <Bookmark className={`h-5 w-5 ${isFav ? "fill-current" : ""}`} />
                    </button>
                    <button
                      onClick={() => mine.toggle(opp.id)}
                      title="Участвую"
                      className={`rounded-xl border p-2 transition-all ${
                        isMine
                          ? "border-emerald-400/60 bg-emerald-50 text-emerald-600"
                          : "border-border text-muted-foreground hover:bg-accent hover:text-foreground"
                      }`}
                    >
                      <FileCheck className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-y-4 border-t border-border/50 pt-6">
                  <Param icon={Globe} label={opp.country ?? "—"} />
                  <Param icon={Clock} label={opp.format ?? "—"} />
                  <Param icon={Calendar} label={opp.duration ?? "—"} />
                  <Param icon={Briefcase} label={opp.cost_label ?? "—"} />
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  {opp.tags.map((tag) => (
                    <span key={tag} className="rounded-lg bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-[#1A4D9C]">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-8 flex items-center justify-between border-t border-border/50 pt-6">
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                    <Calendar className="h-4 w-4" /> {formatDeadline(opp.deadline)}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                    <Sparkles className="h-4 w-4" /> {fit.score}% fit
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => setSelectedOpp(opp)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#1A4D9C] py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
                  >
                    <Sparkles className="h-4 w-4" /> Почему подходит
                  </button>
                  <button
                    onClick={() => createDeadlineMutation.mutate(opp)}
                    disabled={createDeadlineMutation.isPending || createdDeadlines.has(opp.id) || !opp.deadline}
                    title={
                      !opp.deadline
                        ? "У этой активности нет фиксированного дедлайна"
                        : createdDeadlines.has(opp.id)
                        ? "Дедлайн уже добавлен"
                        : "Добавить дедлайн"
                    }
                    className="rounded-2xl border border-border bg-background p-3.5 text-muted-foreground hover:bg-accent transition-all shadow-sm disabled:opacity-50"
                  >
                    {createdDeadlines.has(opp.id) ? <Check className="h-6 w-6 text-emerald-600" /> : <Calendar className="h-6 w-6" />}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Details Modal */}
      <AnimatePresence>
        {selectedOpp && (
          <OpportunityModal
            opp={selectedOpp}
            fit={whyItFits(selectedOpp, ctx)}
            isFav={favorites.has(selectedOpp.id)}
            onToggleFav={() => favorites.toggle(selectedOpp.id)}
            deadlineCreated={createdDeadlines.has(selectedOpp.id)}
            creatingDeadline={createDeadlineMutation.isPending}
            onCreateDeadline={() => createDeadlineMutation.mutate(selectedOpp)}
            onClose={() => setSelectedOpp(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function OpportunityModal({
  opp, fit, isFav, onToggleFav, deadlineCreated, creatingDeadline, onCreateDeadline, onClose,
}: {
  opp: Opportunity;
  fit: { points: string[]; score: number };
  isFav: boolean;
  onToggleFav: () => void;
  deadlineCreated: boolean;
  creatingDeadline: boolean;
  onCreateDeadline: () => void;
  onClose: () => void;
}) {
  const CatIcon = CATEGORY_ICON[opp.category];
  const deadlineLabel = opp.deadline
    ? new Date(opp.deadline).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })
    : "уточняется ежегодно — см. официальный сайт программы";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-3xl overflow-hidden rounded-[28px] bg-background shadow-2xl max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#0F3269] p-6 lg:p-8 text-white relative shrink-0">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors z-10"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-lg bg-white/20 px-2 py-0.5 text-[9px] font-bold text-white backdrop-blur-md">
              <CatIcon className="mr-1 h-2.5 w-2.5" /> {CATEGORY_META[opp.category].label.toUpperCase()}
            </span>
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`h-3 w-3 ${i < (opp.prestige ?? 0) ? "fill-current" : "text-white/20"}`} />
              ))}
            </div>
          </div>

          <h2 className="mt-3 text-2xl font-extrabold lg:text-3xl">{opp.title}</h2>
          <p className="mt-1 text-sm text-blue-100/70 font-medium">{opp.org}</p>

          <div className="mt-6 inline-flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-md border border-white/10">
            <div className="h-8 w-8 flex items-center justify-center rounded-xl bg-emerald-400/20 text-emerald-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[9px] font-bold text-blue-200/60 uppercase tracking-widest">AI СОВПАДЕНИЕ</div>
              <div className="text-xl font-extrabold">{fit.score}%</div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="flex flex-col gap-8">
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-4 w-4 text-[#1A4D9C]" />
                <h3 className="text-lg font-bold font-display">Почему тебе это подходит</h3>
              </div>
              <ul className="space-y-3">
                {fit.points.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground leading-relaxed">
                    <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#1A4D9C]" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <InfoCard icon={Globe} label="СТРАНА" value={opp.country ?? "—"} />
              <InfoCard icon={Briefcase} label="ФОРМАТ" value={opp.format ?? "—"} />
              <InfoCard icon={Clock} label="ДЛИТЕЛЬНОСТЬ" value={opp.duration ?? "—"} />
              <InfoCard icon={Briefcase} label="СТОИМОСТЬ" value={opp.cost_label ?? "—"} />
              <InfoCard icon={GraduationCapUI} label="КЛАССЫ" value={opp.grades.join(", ")} />
              <InfoCard icon={Trophy} label="УРОВЕНЬ" value={opp.level ?? "—"} />
            </div>

            <div className="flex flex-col gap-3">
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Теги</div>
              <div className="flex flex-wrap gap-2">
                {opp.tags.map((tag) => (
                  <span key={tag} className="rounded-lg bg-blue-50 px-3 py-1.5 text-[10px] font-bold text-[#1A4D9C]">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <section className="rounded-2xl bg-blue-50/50 p-6">
              <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">О программе</h3>
              <p className="text-sm text-foreground leading-relaxed">{opp.about}</p>
              <p className="mt-3 text-xs text-muted-foreground">Дедлайн подачи: {deadlineLabel}</p>
            </section>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-background p-6 border-t border-border shrink-0">
          <button
            onClick={onCreateDeadline}
            disabled={creatingDeadline || deadlineCreated || !opp.deadline}
            title={!opp.deadline ? "У этой активности нет фиксированного дедлайна" : undefined}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#1A4D9C] py-4 text-sm font-bold text-white shadow-lg transition-all hover:scale-[1.01] hover:shadow-2xl disabled:opacity-50 disabled:hover:scale-100"
          >
            {creatingDeadline ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : deadlineCreated ? (
              <>
                <Check className="h-5 w-5" /> Дедлайн добавлен
              </>
            ) : !opp.deadline ? (
              <>
                <Calendar className="h-5 w-5" /> Нет фиксированной даты
              </>
            ) : (
              <>
                <Calendar className="h-5 w-5" /> Создать дедлайн
              </>
            )}
          </button>
          <button
            onClick={onToggleFav}
            className={`rounded-xl border p-4 transition-all shadow-md ${
              isFav ? "border-amber-400/60 bg-amber-50 text-amber-600" : "border-border bg-background text-muted-foreground hover:bg-accent"
            }`}
          >
            <Bookmark className={`h-5 w-5 ${isFav ? "fill-current" : ""}`} />
          </button>
        </div>
        {deadlineCreated && (
          <div className="px-6 pb-4 -mt-2 text-center">
            <Link to="/deadlines" className="text-xs text-primary hover:underline">
              Смотреть во вкладке «Дедлайны» →
            </Link>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

function FilterSelect({
  value, onChange, options, placeholder, hideClear,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
  hideClear?: boolean;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none flex items-center gap-3 rounded-2xl bg-background border border-border pl-5 pr-9 h-12 text-sm font-medium hover:bg-accent transition-all shadow-sm cursor-pointer focus:outline-none focus:border-[#1A4D9C] max-w-[200px]"
      >
        {!hideClear && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown className="h-4 w-4 opacity-50 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  );
}

function Param({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <div className="flex items-center gap-3 text-xs font-semibold text-muted-foreground">
      <Icon className="h-4 w-4 opacity-60" /> {label}
    </div>
  );
}

function InfoCard({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card/30 p-5 shadow-sm">
      <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
        <Icon className="h-3 w-3 opacity-60" /> {label}
      </div>
      <div className="text-base font-bold text-foreground">{value}</div>
    </div>
  );
}

function GraduationCapUI(props: any) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 10 12 5l10 5-10 5z" />
      <path d="m7 12 0 6c0 1 3 3 5 3s5-2 5-3l0-6" />
    </svg>
  );
}

export default OpportunitiesPage;
