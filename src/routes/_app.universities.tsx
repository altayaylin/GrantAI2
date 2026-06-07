import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { GraduationCap, MapPin, Search, Check, Star, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UNIVERSITIES, useTargetUnis, LEVEL_META, type UniLevel } from "@/lib/target-unis";

export const Route = createFileRoute("/_app/universities")({
  component: UniversitiesPage,
});

function UniversitiesPage() {
  const { list, toggle, setLevel } = useTargetUnis();
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState<string>("Все");

  const countries = useMemo(
    () => ["Все", ...Array.from(new Set(UNIVERSITIES.map((u) => u.country)))],
    [],
  );

  const filtered = UNIVERSITIES.filter((u) => {
    const matchesQ =
      !query ||
      u.name.toLowerCase().includes(query.toLowerCase()) ||
      u.country.toLowerCase().includes(query.toLowerCase()) ||
      u.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()));
    const matchesC = country === "Все" || u.country === country;
    return matchesQ && matchesC;
  });

  const chosen = new Map(list.map((t) => [t.id, t.level]));

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section
        className="rounded-2xl p-6 md:p-8 text-white"
        style={{ background: "var(--gradient-deep)" }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold">Университеты</h1>
            <p className="text-white/70 text-sm mt-1.5 max-w-xl">
              Выбери целевые вузы — они появятся в твоём профиле и помогут AI подбирать
              активности и эссе под их требования.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Stat label="Выбрано" value={list.length} />
            <Stat label="Reach" value={list.filter((u) => u.level === "reach").length} />
            <Stat label="Match" value={list.filter((u) => u.level === "match").length} />
            <Stat label="Safety" value={list.filter((u) => u.level === "safety").length} />
          </div>
        </div>
      </section>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Найти университет, страну или направление…"
            className="w-full h-10 pl-9 pr-3 rounded-xl border border-border bg-card text-sm focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {countries.map((c) => (
            <button
              key={c}
              onClick={() => setCountry(c)}
              className={`px-3 h-10 rounded-xl text-sm border transition-colors ${
                country === c
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border hover:border-primary/40"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((u) => {
          const level = chosen.get(u.id);
          const selected = !!level;
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
                      <MapPin className="h-3 w-3" /> {u.city}, {u.country}
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="shrink-0 gap-1">
                  <Star className="h-3 w-3" />#{u.ranking}
                </Badge>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">{u.blurb}</p>

              <div className="grid grid-cols-3 gap-2 text-center">
                <Mini label="Прием" value={u.acceptance} />
                <Mini label="Ср. SAT" value={String(u.avgSAT)} />
                <Mini label="Стоимость" value={u.tuition} />
              </div>

              <div className="flex flex-wrap gap-1.5">
                {u.tags.map((t) => (
                  <Badge key={t} variant="secondary" className="font-normal">
                    {t}
                  </Badge>
                ))}
              </div>

              <div className="pt-2 border-t border-border flex items-center justify-between gap-2">
                {selected ? (
                  <>
                    <LevelPicker
                      value={level!}
                      onChange={(lv) => setLevel(u.id, lv)}
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggle(u.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      Убрать
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => toggle(u.id, "match")}
                    className="w-full"
                  >
                    <Trophy className="h-4 w-4" /> Добавить в цели
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground text-sm">
          Ничего не найдено — попробуй другой запрос.
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

function LevelPicker({
  value,
  onChange,
}: {
  value: UniLevel;
  onChange: (v: UniLevel) => void;
}) {
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
              active
                ? LEVEL_META[lv].tone + " border"
                : "text-muted-foreground hover:text-foreground"
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
