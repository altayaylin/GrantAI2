import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Search,
  Filter,
  Bookmark,
  BookmarkCheck,
  CalendarPlus,
  Sparkles,
  MapPin,
  Calendar,
  Clock,
  GraduationCap,
  Wallet,
  Globe,
  Trophy,
  Star,
  Check,
  Wrench,
  X,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  OPPORTUNITIES,
  CATEGORY_META,
  useFavorites,
  useMyActivities,
  whyItFits,
  type Opportunity,
  type OppCategory,
} from "@/lib/opportunities";
import { useTargetUnis, UNIVERSITIES } from "@/lib/target-unis";

export const Route = createFileRoute("/_app/opportunities")({
  component: OpportunitiesPage,
});

const studentCtx = {
  interests: ["AI", "Machine Learning", "Robotics", "Quantitative Finance"],
  major: "Computer Science",
  grade: 12,
};

function OpportunitiesPage() {
  const [category, setCategory] = useState<OppCategory>("internship");
  const [search, setSearch] = useState("");
  const [country, setCountry] = useState<string>("all");
  const [format, setFormat] = useState<string>("all");
  const [cost, setCost] = useState<string>("all");
  const [grade, setGrade] = useState<string>("all");
  const [sort, setSort] = useState<string>("deadline");
  const [active, setActive] = useState<Opportunity | null>(null);

  const fav = useFavorites();
  const mine = useMyActivities();
  const { list: targets } = useTargetUnis();
  const targetCountries = Array.from(
    new Set(
      targets
        .map((t) => UNIVERSITIES.find((u) => u.id === t.id)?.country)
        .filter(Boolean) as string[],
    ),
  );
  const ctx = { ...studentCtx, targetCountries };

  const inCategory = OPPORTUNITIES.filter((o) => o.category === category);

  const countries = Array.from(new Set(inCategory.map((o) => o.country)));

  const filtered = useMemo(() => {
    let list = inCategory.filter((o) => {
      if (search && !`${o.title} ${o.org} ${o.tags.join(" ")}`.toLowerCase().includes(search.toLowerCase()))
        return false;
      if (country !== "all" && o.country !== country) return false;
      if (format !== "all" && o.format !== format) return false;
      if (cost !== "all" && o.cost !== cost) return false;
      if (grade !== "all" && !o.grades.includes(Number(grade))) return false;
      return true;
    });
    if (sort === "deadline") list = [...list].sort((a, b) => a.deadline.localeCompare(b.deadline));
    if (sort === "prestige") list = [...list].sort((a, b) => b.prestige - a.prestige);
    if (sort === "fit")
      list = [...list].sort(
        (a, b) => whyItFits(b, ctx).score - whyItFits(a, ctx).score,
      );
    return list;
  }, [inCategory, search, country, format, cost, grade, sort, ctx]);

  const meta = CATEGORY_META[category];

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section
        className="rounded-2xl p-6 md:p-8 text-white relative overflow-hidden"
        style={{ background: "var(--gradient-deep)" }}
      >
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs mb-3 backdrop-blur">
            <Sparkles className="h-3 w-3" /> AI подбирает под твой профиль
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold">Активности</h1>
          <p className="text-sm text-white/75 mt-2 max-w-xl">
            Стажировки, research-программы и конкурсы, усиливающие твой профиль под целевые
            вузы. Сохраняй в избранное, добавляй дедлайны и читай AI-разбор «почему подходит».
          </p>
          <div className="mt-5 flex flex-wrap gap-3 text-xs">
            <Stat label="Подобрано" value={String(OPPORTUNITIES.length)} />
            <Stat label="В избранном" value={String(fav.list.length)} />
            <Stat label="Участвую" value={String(mine.list.length)} />
            <Stat label="Целевых стран" value={String(targetCountries.length || "—")} />
          </div>
        </div>
      </section>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2">
        {(Object.keys(CATEGORY_META) as OppCategory[]).map((c) => {
          const m = CATEGORY_META[c];
          const isActive = c === category;
          return (
            <button
              key={c}
              onClick={() => m.available && setCategory(c)}
              disabled={!m.available}
              className={`group inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm transition-all ${
                isActive
                  ? "border-primary bg-primary text-primary-foreground shadow-[var(--shadow-soft)]"
                  : m.available
                    ? "border-border bg-card hover:border-primary/40 hover:bg-muted/40"
                    : "border-dashed border-border bg-muted/30 text-muted-foreground cursor-not-allowed"
              }`}
            >
              <span>{m.emoji}</span>
              <span className="font-medium">{m.label}</span>
              {!m.available && (
                <span className="text-[10px] uppercase tracking-wider inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                  <Wrench className="h-2.5 w-2.5" /> in dev
                </span>
              )}
              {m.available && (
                <span
                  className={`text-[10px] ${
                    isActive ? "text-primary-foreground/70" : "text-muted-foreground"
                  }`}
                >
                  {OPPORTUNITIES.filter((o) => o.category === c).length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {!meta.available ? (
        <ComingSoon category={category} />
      ) : (
        <>
          {/* Filters */}
          <section className="rounded-2xl border border-border bg-card p-4 md:p-5 shadow-[var(--shadow-soft)]">
            <div className="flex items-center gap-2 mb-3 text-sm font-medium">
              <Filter className="h-4 w-4 text-primary" /> Фильтры
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-2.5">
              <div className="lg:col-span-2 relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Название, организация, тег…"
                  className="pl-9 h-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <FilterSelect value={country} onChange={setCountry} placeholder="Страна / формат">
                <SelectItem value="all">Все страны</SelectItem>
                {countries.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </FilterSelect>
              <FilterSelect value={format} onChange={setFormat} placeholder="Формат">
                <SelectItem value="all">Любой формат</SelectItem>
                <SelectItem value="Онлайн">Онлайн</SelectItem>
                <SelectItem value="Офлайн">Офлайн</SelectItem>
                <SelectItem value="Гибрид">Гибрид</SelectItem>
              </FilterSelect>
              <FilterSelect value={cost} onChange={setCost} placeholder="Стоимость">
                <SelectItem value="all">Любая стоимость</SelectItem>
                <SelectItem value="free">Бесплатно</SelectItem>
                <SelectItem value="stipend">Со стипендией</SelectItem>
                <SelectItem value="paid">Платно</SelectItem>
              </FilterSelect>
              <FilterSelect value={grade} onChange={setGrade} placeholder="Класс">
                <SelectItem value="all">Любой класс</SelectItem>
                <SelectItem value="9">9 класс</SelectItem>
                <SelectItem value="10">10 класс</SelectItem>
                <SelectItem value="11">11 класс</SelectItem>
                <SelectItem value="12">12 класс</SelectItem>
              </FilterSelect>
            </div>
            <div className="flex items-center justify-between mt-4">
              <div className="text-xs text-muted-foreground">
                Найдено{" "}
                <span className="font-medium text-foreground">{filtered.length}</span> из{" "}
                {inCategory.length}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Сортировка:</span>
                <FilterSelect value={sort} onChange={setSort} placeholder="">
                  <SelectItem value="deadline">По дедлайну</SelectItem>
                  <SelectItem value="prestige">По престижу</SelectItem>
                  <SelectItem value="fit">AI: лучшее совпадение</SelectItem>
                </FilterSelect>
              </div>
            </div>
          </section>

          {/* Grid */}
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
              Под текущие фильтры ничего не нашлось — попробуй ослабить критерии.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((o) => (
                <OppCard
                  key={o.id}
                  opp={o}
                  ctx={ctx}
                  saved={fav.has(o.id)}
                  joined={mine.has(o.id)}
                  onSave={() => fav.toggle(o.id)}
                  onJoin={() => mine.toggle(o.id)}
                  onOpen={() => setActive(o)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Modal */}
      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-2xl max-h-[88vh] overflow-y-auto sm:rounded-2xl p-0">
          {active && <OppModal opp={active} ctx={ctx} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/10 px-3 py-2 backdrop-blur">
      <div className="text-[10px] uppercase tracking-wider text-white/60">{label}</div>
      <div className="text-base font-semibold">{value}</div>
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  placeholder,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  children: React.ReactNode;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-9">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>{children}</SelectContent>
    </Select>
  );
}

function OppCard({
  opp,
  ctx,
  saved,
  joined,
  onSave,
  onJoin,
  onOpen,
}: {
  opp: Opportunity;
  ctx: Parameters<typeof whyItFits>[1];
  saved: boolean;
  joined: boolean;
  onSave: () => void;
  onJoin: () => void;
  onOpen: () => void;
}) {
  const m = CATEGORY_META[opp.category];
  const fit = whyItFits(opp, ctx);
  const daysLeft = Math.ceil((+new Date(opp.deadline) - Date.now()) / 86400000);
  const urgent = daysLeft >= 0 && daysLeft <= 30;

  return (
    <article className="group rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)] hover:border-primary/40 hover:shadow-[var(--shadow-glow)] transition-all flex flex-col">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 mb-2">
            <span className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-md border ${m.tone}`}>
              {m.emoji} {m.label}
            </span>
            {Array.from({ length: opp.prestige }).map((_, i) => (
              <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <h3 className="font-semibold leading-snug truncate">{opp.title}</h3>
          <div className="text-xs text-muted-foreground mt-0.5">{opp.org}</div>
        </div>
        <button
          onClick={onSave}
          className="shrink-0 h-8 w-8 grid place-items-center rounded-lg hover:bg-muted transition-colors"
          aria-label="Сохранить"
        >
          {saved ? (
            <BookmarkCheck className="h-4 w-4 text-primary" />
          ) : (
            <Bookmark className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-3">
        <Meta icon={Globe} text={opp.country} />
        <Meta icon={MapPin} text={opp.format} />
        <Meta icon={Clock} text={opp.duration} />
        <Meta icon={Wallet} text={opp.costLabel} />
      </div>

      <div className="flex flex-wrap gap-1 mb-4">
        {opp.tags.slice(0, 3).map((t) => (
          <Badge key={t} variant="secondary" className="font-normal text-[10px]">
            {t}
          </Badge>
        ))}
      </div>

      <div className="mt-auto space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="inline-flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            <span className={urgent ? "text-rose-600 font-medium" : "text-muted-foreground"}>
              {new Date(opp.deadline).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" })}
              {daysLeft >= 0 && <span className="ml-1.5 opacity-70">· {daysLeft} дн</span>}
            </span>
          </div>
          <div className="inline-flex items-center gap-1 text-emerald-600 font-medium">
            <Sparkles className="h-3 w-3" /> {fit.score}% fit
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" onClick={onOpen} className="flex-1">
            <Sparkles className="h-3.5 w-3.5" /> Почему подходит
          </Button>
          <Button
            size="sm"
            variant={joined ? "secondary" : "outline"}
            onClick={onJoin}
            title={joined ? "В моих активностях" : "Добавить в профиль"}
          >
            {joined ? <Check className="h-3.5 w-3.5" /> : <CalendarPlus className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>
    </article>
  );
}

function Meta({ icon: Icon, text }: { icon: React.ComponentType<{ className?: string }>; text: string }) {
  return (
    <div className="inline-flex items-center gap-1.5 truncate">
      <Icon className="h-3 w-3 shrink-0" />
      <span className="truncate">{text}</span>
    </div>
  );
}

function OppModal({ opp, ctx }: { opp: Opportunity; ctx: Parameters<typeof whyItFits>[1] }) {
  const m = CATEGORY_META[opp.category];
  const fit = whyItFits(opp, ctx);
  const mine = useMyActivities();
  const fav = useFavorites();

  return (
    <div>
      <div
        className="p-6 text-white rounded-t-2xl relative"
        style={{ background: "var(--gradient-deep)" }}
      >
        <div className="flex items-center gap-2 mb-3">
          <span className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-md bg-white/15 backdrop-blur`}>
            {m.emoji} {m.label}
          </span>
          {Array.from({ length: opp.prestige }).map((_, i) => (
            <Star key={i} className="h-3 w-3 fill-amber-300 text-amber-300" />
          ))}
        </div>
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{opp.title}</DialogTitle>
        </DialogHeader>
        <div className="text-sm text-white/75 mt-1">{opp.org}</div>

        <div className="mt-5 inline-flex items-center gap-3 rounded-xl bg-white/10 backdrop-blur px-4 py-3">
          <div className="h-10 w-10 rounded-lg bg-emerald-400/20 grid place-items-center">
            <Sparkles className="h-5 w-5 text-emerald-300" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-white/60">AI совпадение</div>
            <div className="text-2xl font-semibold leading-none mt-0.5">{fit.score}%</div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-sm">Почему тебе это подходит</h3>
          </div>
          <ul className="space-y-2.5">
            {fit.points.map((p, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm">
                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                <span className="text-muted-foreground leading-relaxed">{p}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <ModalMeta icon={Globe} label="Страна" value={opp.country} />
          <ModalMeta icon={MapPin} label="Формат" value={opp.format} />
          <ModalMeta icon={Clock} label="Длительность" value={opp.duration} />
          <ModalMeta icon={Wallet} label="Стоимость" value={opp.costLabel} />
          <ModalMeta icon={GraduationCap} label="Классы" value={opp.grades.join(", ")} />
          <ModalMeta icon={Trophy} label="Уровень" value={opp.level} />
        </div>

        <div>
          <div className="text-xs font-medium text-muted-foreground mb-2">Теги</div>
          <div className="flex flex-wrap gap-1.5">
            {opp.tags.map((t) => (
              <Badge key={t} variant="secondary" className="font-normal">{t}</Badge>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-muted/40 border border-border p-4">
          <div className="text-xs font-medium text-muted-foreground mb-1">О программе</div>
          <p className="text-sm leading-relaxed">{opp.about}</p>
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <Button className="flex-1" onClick={() => mine.toggle(opp.id)}>
            {mine.has(opp.id) ? (
              <><Check className="h-4 w-4" /> В моих активностях</>
            ) : (
              <><CalendarPlus className="h-4 w-4" /> Создать дедлайн</>
            )}
          </Button>
          <Button variant="outline" onClick={() => fav.toggle(opp.id)}>
            {fav.has(opp.id) ? <BookmarkCheck className="h-4 w-4 text-primary" /> : <Bookmark className="h-4 w-4" />}
          </Button>
          {opp.link && (
            <Button variant="outline" asChild>
              <a href={opp.link} target="_blank" rel="noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function ModalMeta({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-border p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground inline-flex items-center gap-1.5">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <div className="text-sm font-medium mt-1">{value}</div>
    </div>
  );
}

function ComingSoon({ category }: { category: OppCategory }) {
  const m = CATEGORY_META[category];
  return (
    <div className="rounded-2xl border border-dashed border-border p-12 text-center">
      <div className="text-4xl mb-3">{m.emoji}</div>
      <div className="font-semibold">{m.label} — в разработке</div>
      <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
        Скоро здесь появится каталог. Сейчас доступны стажировки и исследования —
        начни с них, чтобы AI быстрее построил рекомендации.
      </p>
      <div className="inline-flex items-center gap-1.5 mt-4 text-xs text-muted-foreground">
        <Wrench className="h-3 w-3" /> In development
      </div>
    </div>
  );
}

// Avoid unused-imports tripping the build
void X;
