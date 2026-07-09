import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GraduationCap, MapPin, Search, Check, Star, Trophy, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LEVEL_META, type UniLevel } from "@/lib/target-unis";
import { api } from "@/lib/api";
import { formatAcceptance, formatTuition, uniTags, uniBlurb, type University, type MyListItem } from "@/lib/types";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/universities")({
  component: UniversitiesPage,
});

function UniversitiesPage() {
  const qc = useQueryClient();
  const [query, setQuery] = useState("");
  const [showAllMajors, setShowAllMajors] = useState(false);

  const { data: universities = [], isLoading, error } = useQuery({
    queryKey: ["universities"],
    queryFn: () => api.universities.list(),
    staleTime: 5 * 60 * 1000,
  });

  const { data: myList = [] } = useQuery({
    queryKey: ["my-list"],
    queryFn: () => api.universities.myList(),
  });

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: () => api.profile.get(),
    retry: false,
  });

  const addMutation = useMutation({
    mutationFn: ({ id, category }: { id: string; category: UniLevel }) =>
      api.universities.add(id, category),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ["my-list"] });
      const uni = universities.find((u) => u.id === id);
      toast.success(`${uni?.name ?? "Вуз"} добавлен в список`);
    },
    onError: () => toast.error("Не удалось добавить вуз"),
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => api.universities.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-list"] }),
    onError: () => toast.error("Не удалось убрать вуз"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, category }: { id: string; category: UniLevel }) =>
      api.universities.updateCategory(id, category),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-list"] }),
  });

  const chosen = useMemo<Map<string, UniLevel>>(() => {
    const m = new Map<string, UniLevel>();
    myList.forEach((item: MyListItem) => {
      if (item.category) m.set(item.university_id, item.category as UniLevel);
      else m.set(item.university_id, "match");
    });
    return m;
  }, [myList]);

  const majorFilterActive = !!profile?.major && !showAllMajors;

  const filtered = universities.filter((u) => {
    const q = query.toLowerCase();
    const matchesQuery =
      !query ||
      u.name.toLowerCase().includes(q) ||
      u.country.toLowerCase().includes(q) ||
      u.majors.some((t) => t.toLowerCase().includes(q));
    const matchesMajor =
      !majorFilterActive ||
      u.majors.some((t) => t.toLowerCase() === profile!.major!.toLowerCase());
    return matchesQuery && matchesMajor;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32 gap-3 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" /> Загружаем университеты…
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
    <div className="space-y-6">
      {/* Hero */}
      <section
        className="relative overflow-hidden rounded-[32px] p-8 lg:p-12 text-white shadow-2xl"
        style={{ background: "linear-gradient(135deg, #0F3269 0%, #1A4D9C 100%)" }}
      >
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
              <GraduationCap className="h-3 w-3" /> СПИСОК УНИВЕРСИТЕТОВ
            </div>
            <h1 className="font-display text-4xl font-extrabold lg:text-5xl leading-tight">
              Университеты
            </h1>
            <p className="mt-4 text-base text-blue-100/80 leading-relaxed lg:text-lg">
              {universities.length} вузов в базе. Добавляй в цели — они появятся в профиле и создадут дедлайны.
            </p>
          </div>
          <div className="flex items-center gap-4 sm:gap-6">
            <Stat label="ВЫБРАНО"  value={myList.length} />
            <div className="h-10 w-px bg-white/10 hidden sm:block" />
            <Stat label="REACH"  value={myList.filter((u: MyListItem) => u.category === "reach").length} />
            <Stat label="MATCH"  value={myList.filter((u: MyListItem) => u.category === "match" || !u.category).length} />
            <Stat label="SAFETY" value={myList.filter((u: MyListItem) => u.category === "safety").length} />
          </div>
        </div>
      </section>

      {/* Filters */}
      <div className="space-y-2.5">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Найти университет, страну или специальность…"
              className="w-full h-10 pl-9 pr-3 rounded-xl border border-border bg-card text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          {profile?.major && (
            <button
              type="button"
              onClick={() => setShowAllMajors((v) => !v)}
              className={`h-10 px-4 rounded-xl text-sm border transition-colors inline-flex items-center gap-1.5 shrink-0 ${
                majorFilterActive
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border hover:border-primary/40"
              }`}
            >
              {majorFilterActive && <Check className="h-3.5 w-3.5" />}
              <Star className="h-3.5 w-3.5" />
              {majorFilterActive ? `Только ${profile.major}` : "Показать все направления"}
            </button>
          )}
        </div>
        {majorFilterActive && (
          <p className="text-sm text-muted-foreground px-1">
            Показаны только вузы с направлением «{profile!.major}». Нажми на кнопку выше, чтобы посмотреть остальные.
          </p>
        )}
        <p className="text-sm text-muted-foreground px-1">
          Выбор целевых стран вы можете сделать в разделе{" "}
          <Link
            to="/profile"
            search={{ edit: "countries" }}
            className="font-semibold text-[#1A4D9C] hover:text-[#0F3269] hover:underline underline-offset-2 transition-colors"
          >
            «Профиль»
          </Link>
          .
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((u: University) => {
          const level = chosen.get(u.id);
          const selected = chosen.has(u.id);
          return (
            <div
              key={u.id}
              className={`rounded-2xl border p-5 bg-card transition-all flex flex-col gap-4 ${
                selected
                  ? "border-primary/60 shadow-[var(--shadow-soft)]"
                  : "border-border hover:border-primary/40 hover:shadow-[var(--shadow-soft)]"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className="h-11 w-11 rounded-xl grid place-items-center text-white shrink-0"
                    style={{ background: "var(--gradient-brand)" }}
                  >
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold leading-tight truncate">{u.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5 inline-flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {u.country}
                    </div>
                  </div>
                </div>
                {u.qs_rank && (
                  <Badge variant="outline" className="shrink-0 gap-1">
                    <Star className="h-3 w-3" />#{u.qs_rank}
                  </Badge>
                )}
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">{uniBlurb(u)}</p>

              <div className="grid grid-cols-3 gap-2 text-center">
                <Mini label="Прием"    value={formatAcceptance(u.acceptance_rate)} />
                <Mini label="SAT 75%"  value={u.sat_75th ? String(u.sat_75th) : "—"} />
                <Mini label="Стоимость" value={formatTuition(u.tuition_usd)} />
              </div>

              <div className="flex flex-wrap gap-1.5">
                {uniTags(u, profile?.major).map((t) => {
                  const isMyMajor = profile?.major && t.toLowerCase() === profile.major.toLowerCase();
                  return (
                    <Badge
                      key={t}
                      variant={isMyMajor ? "default" : "secondary"}
                      className={isMyMajor ? "font-semibold gap-1" : "font-normal"}
                    >
                      {isMyMajor && <Star className="h-3 w-3" />}
                      {t}
                    </Badge>
                  );
                })}
                {u.has_scholarship && (
                  <Badge variant="secondary" className="font-normal bg-emerald-500/10 text-emerald-700">Стипендия</Badge>
                )}
              </div>

              <div className="pt-2 border-t border-border flex items-center justify-between gap-2">
                {selected ? (
                  <>
                    <LevelPicker
                      value={level!}
                      onChange={(lv) => updateMutation.mutate({ id: u.id, category: lv })}
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeMutation.mutate(u.id)}
                      disabled={removeMutation.isPending}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      Убрать
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => addMutation.mutate({ id: u.id, category: "match" })}
                    disabled={addMutation.isPending}
                    className="w-full"
                  >
                    {addMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trophy className="h-4 w-4" />
                    )}{" "}
                    Добавить в цели
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && !isLoading && (
        <div className="text-center py-16 text-muted-foreground text-sm">
          {majorFilterActive
            ? <>Ни один вуз в базе не предлагает «{profile!.major}». <button type="button" onClick={() => setShowAllMajors(true)} className="text-primary font-medium hover:underline">Показать все направления</button>.</>
            : "Ничего не найдено — попробуй другой запрос."}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <div className="text-2xl font-semibold">{value}</div>
      <div className="text-[11px] text-white/60 uppercase tracking-wider">{label}</div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/40 py-2 px-1">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-sm font-medium mt-0.5">{value}</div>
    </div>
  );
}

function LevelPicker({ value, onChange }: { value: UniLevel; onChange: (v: UniLevel) => void }) {
  const levels: UniLevel[] = ["reach", "match", "safety"];
  return (
    <div className="inline-flex rounded-lg border border-border p-0.5 bg-muted/30">
      {levels.map((lv) => {
        const active = value === lv;
        return (
          <button
            key={lv}
            onClick={() => onChange(lv)}
            title={LEVEL_META[lv].desc}
            className={`px-2.5 py-1 text-xs rounded-md font-medium inline-flex items-center gap-1 transition-colors ${
              active ? LEVEL_META[lv].tone + " border" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {active && <Check className="h-3 w-3" />}
            {LEVEL_META[lv].label}
          </button>
        );
      })}
    </div>
  );
}
