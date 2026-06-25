import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
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
  CheckCircle2,
  Sparkles,
  Zap
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/opportunities")({
  component: OpportunitiesPage,
});

type Opportunity = {
  id: string;
  category: string;
  categoryLabel: string;
  title: string;
  org: string;
  rating: number;
  location: string;
  format: string;
  duration: string;
  cost: string;
  tags: string[];
  deadline: string;
  fitScore: number;
  description: string;
  whyFit: string[];
  grades: string;
  level: string;
};

const OPPORTUNITIES: Opportunity[] = [
  {
    id: "1",
    category: "RESEARCH",
    categoryLabel: "ИССЛЕДОВАНИЯ",
    title: "MIT PRIMES-USA",
    org: "Massachusetts Institute of Technology",
    rating: 5,
    location: "США / Удалённо",
    format: "Онлайн",
    duration: "1 год, удалённо",
    cost: "Бесплатно",
    tags: ["Math", "CS", "Research"],
    deadline: "30 нояб. 2025 г.",
    fitScore: 60,
    description: "Годовая программа исследований по математике и CS под менторством PhD из MIT. Один из самых сильных research-проектов для школьников.",
    whyFit: [
      "Прямая привязка к твоему мейджору (Computer Science): research/опыт здесь напрямую цитируется в эссе и Common App activities.",
      "Программа обычно набирает 10, 11 классы — стоит уточнить, рассмотрят ли тебя.",
      "Tier-1 престиж: попадание сюда — сильный сигнал для top-20 вузов, особенно Ivy+ и MIT/Stanford."
    ],
    grades: "10, 11",
    level: "Продвинутый"
  },
  {
    id: "2",
    category: "RESEARCH",
    categoryLabel: "ИССЛЕДОВАНИЯ",
    title: "Research Science Institute (RSI)",
    org: "CEE × MIT",
    rating: 5,
    location: "США",
    format: "Офлайн",
    duration: "6 недель, лето",
    cost: "Полностью покрыто",
    tags: ["STEM", "Research", "Top-tier"],
    deadline: "12 янв. 2026 г.",
    fitScore: 50,
    description: "Самая престижная летняя научная программа в мире для школьников, проходящая на базе MIT.",
    whyFit: [
      "Экстремальный селективный отбор — идеальное подтверждение твоих академических способностей.",
      "Нетворкинг с лучшими будущими учеными мира.",
      "Гарантированный 'strong' сигнал для приёмных комиссий MIT и Harvard."
    ],
    grades: "11",
    level: "Эксперт"
  },
  {
    id: "3",
    category: "RESEARCH",
    categoryLabel: "ИССЛЕДОВАНИЯ",
    title: "Pioneer Research Program",
    org: "Pioneer Academics",
    rating: 4,
    location: "Онлайн",
    format: "Онлайн",
    duration: "4 месяца",
    cost: "$6 500 (есть финпомощь)",
    tags: ["Research", "1-on-1", "Любая дисциплина"],
    deadline: "28 февр. 2026 г.",
    fitScore: 80,
    description: "Единственная онлайн-программа исследований для школьников, аккредитованная Оберлинским колледжем.",
    whyFit: [
      "Высокий шанс на получение 1-на-1 менторства профессора топового колледжа.",
      "Возможность опубликовать работу в их журнале.",
      "Гибкость в выборе темы под твои интересы."
    ],
    grades: "10, 11, 12",
    level: "Средний/Продвинутый"
  },
  {
    id: "4",
    category: "RESEARCH",
    categoryLabel: "ИССЛЕДОВАНИЯ",
    title: "Polygence Core",
    org: "Polygence",
    rating: 3,
    location: "Онлайн",
    format: "Онлайн",
    duration: "10 встреч / 3 мес",
    cost: "$2 500 (есть scholarships)",
    tags: ["Research", "Mentorship", "Любая тема"],
    deadline: "15 мая 2026 г.",
    fitScore: 55,
    description: "Программа менторства 1-на-1 для создания собственного исследовательского проекта.",
    whyFit: [
      "Индивидуальный график работы.",
      "Хорошая подготовка к написанию Extended Essay или портфолио.",
      "Более доступная альтернатива Pioneer."
    ],
    grades: "9, 10, 11, 12",
    level: "Базовый/Средний"
  }
];

function OpportunitiesPage() {
  const [selectedCategory, setSelectedCategory] = useState("Research");
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);

  const stats = [
    { label: "ПОДОБРАНО", value: "8" },
    { label: "В ИЗБРАННОМ", value: "0" },
    { label: "УЧАСТВУЮ", value: "0" },
    { label: "ЦЕЛЕВЫХ СТРАН", value: "—" },
  ];

  const categories = [
    { id: "Internships", name: "Стажировки", count: 4, icon: Briefcase },
    { id: "Research", name: "Исследования", count: 4, icon: FlaskConical },
    { id: "Olympiads", name: "Олимпиады", icon: Trophy, isDev: true },
    { id: "Volunteering", name: "Волонтёрство", icon: Heart, isDev: true },
  ];

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
        
        {/* Decorative elements */}
        <div className="absolute right-0 top-0 h-full w-1/3 opacity-10 pointer-events-none">
          <Zap className="h-full w-full rotate-12 transform scale-125" />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-3">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => !cat.isDev && setSelectedCategory(cat.id)}
            className={`flex items-center gap-2.5 rounded-2xl border px-5 py-3 text-sm font-semibold transition-all duration-200 ${
              selectedCategory === cat.id
                ? "bg-[#1A4D9C] border-[#1A4D9C] text-white shadow-lg"
                : "bg-card border-border text-muted-foreground hover:bg-accent"
            } ${cat.isDev ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            <cat.icon className={`h-4 w-4 ${selectedCategory === cat.id ? "text-white" : "text-amber-600"}`} />
            {cat.name} {cat.count && <span className="opacity-60 font-mono text-[10px]">{cat.count}</span>}
            {cat.isDev && <span className="text-[9px] uppercase tracking-tighter opacity-50 ml-1">IN DEV</span>}
          </button>
        ))}
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
              placeholder="Название, организация, тег"
              className="w-full h-12 rounded-2xl bg-background border border-border pl-11 pr-4 text-sm focus:outline-none focus:border-[#1A4D9C] focus:ring-4 focus:ring-blue-100 transition-all font-medium"
            />
          </div>

          <FilterDropdown label="Все страны" />
          <FilterDropdown label="Любой формат" />
          <FilterDropdown label="Любая стоимость" />
          <FilterDropdown label="Любой класс" />
        </div>

        <div className="mt-8 flex items-center justify-between border-t border-border/50 pt-4">
          <div className="text-xs text-muted-foreground">Найдено <strong className="text-foreground">4</strong> из 4</div>
          <div className="flex items-center gap-3">
             <span className="text-xs text-muted-foreground">Сортировка:</span>
             <button className="flex items-center gap-2 rounded-xl bg-background border border-border px-4 py-2 text-xs font-bold hover:bg-accent transition-colors">
               По дедлайну <ChevronDown className="h-3 w-3" />
             </button>
          </div>
        </div>
      </div>

      {/* Opportunities Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {OPPORTUNITIES.map((opp) => (
          <motion.div
            key={opp.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group relative flex flex-col rounded-3xl border border-border bg-card p-8 shadow-sm transition-all hover:shadow-xl hover:border-blue-200"
          >
            {/* Card Header */}
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                   <span className="inline-flex items-center rounded-lg bg-indigo-100 px-2.5 py-1 text-[10px] font-bold text-indigo-700">
                     <FlaskConical className="mr-1 h-3 w-3" /> {opp.categoryLabel}
                   </span>
                   <div className="flex text-amber-400">
                     {[...Array(5)].map((_, i) => (
                       <Star key={i} className={`h-3 w-3 ${i < opp.rating ? "fill-current" : "text-gray-200"}`} />
                     ))}
                   </div>
                </div>
                <h3 className="text-xl font-bold text-foreground mt-1 group-hover:text-[#1A4D9C] transition-colors">{opp.title}</h3>
                <p className="text-sm text-muted-foreground font-medium">{opp.org}</p>
              </div>
              <button className="rounded-xl border border-border p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-all">
                <Bookmark className="h-5 w-5" />
              </button>
            </div>

            {/* Params Grid */}
            <div className="mt-6 grid grid-cols-2 gap-y-4 border-t border-border/50 pt-6">
              <Param icon={Globe} label={opp.location} />
              <Param icon={Clock} label={opp.format} />
              <Param icon={Calendar} label={opp.duration} />
              <Param icon={Briefcase} label={opp.cost} />
            </div>

            {/* Tags */}
            <div className="mt-6 flex flex-wrap gap-2">
              {opp.tags.map((tag) => (
                <span key={tag} className="rounded-lg bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-[#1A4D9C]">
                  {tag}
                </span>
              ))}
            </div>

            {/* Footer Row */}
            <div className="mt-8 flex items-center justify-between border-t border-border/50 pt-6">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <Calendar className="h-4 w-4" /> {opp.deadline}
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                <Sparkles className="h-4 w-4" /> {opp.fitScore}% fit
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex gap-3">
              <button 
                onClick={() => setSelectedOpp(opp)}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#1A4D9C] py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
              >
                <Sparkles className="h-4 w-4" /> Почему подходит
              </button>
              <button className="rounded-2xl border border-border bg-background p-3.5 text-muted-foreground hover:bg-accent transition-all shadow-sm">
                <Calendar className="h-6 w-6" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Details Modal */}
      <AnimatePresence>
        {selectedOpp && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onClick={() => setSelectedOpp(null)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-3xl overflow-hidden rounded-[28px] bg-background shadow-2xl max-h-[92vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header Banner */}
              <div className="bg-[#0F3269] p-6 lg:p-8 text-white relative shrink-0">
                 <button 
                   onClick={() => setSelectedOpp(null)}
                   className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors z-10"
                 >
                   <X className="h-4 w-4" />
                 </button>

                 <div className="flex items-center gap-2">
                    <span className="inline-flex items-center rounded-lg bg-white/20 px-2 py-0.5 text-[9px] font-bold text-white backdrop-blur-md">
                      <FlaskConical className="mr-1 h-2.5 w-2.5" /> {selectedOpp.categoryLabel}
                    </span>
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-3 w-3 ${i < selectedOpp.rating ? "fill-current" : "text-white/20"}`} />
                      ))}
                    </div>
                 </div>

                 <h2 className="mt-3 text-2xl font-extrabold lg:text-3xl">{selectedOpp.title}</h2>
                 <p className="mt-1 text-sm text-blue-100/70 font-medium">{selectedOpp.org}</p>

                 <div className="mt-6 inline-flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-md border border-white/10">
                    <div className="h-8 w-8 flex items-center justify-center rounded-xl bg-emerald-400/20 text-emerald-400">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-[9px] font-bold text-blue-200/60 uppercase tracking-widest">AI СОВПАДЕНИЕ</div>
                      <div className="text-xl font-extrabold">{selectedOpp.fitScore}%</div>
                    </div>
                 </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 lg:p-8">
                <div className="flex flex-col gap-8">
                  {/* Why Fit Section */}
                  <section>
                    <div className="flex items-center gap-2 mb-4">
                       <Sparkles className="h-4 w-4 text-[#1A4D9C]" />
                       <h3 className="text-lg font-bold font-display">Почему тебе это подходит</h3>
                    </div>
                    <ul className="space-y-3">
                      {selectedOpp.whyFit.map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground leading-relaxed">
                          <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#1A4D9C]" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </section>

                  {/* Info Grid */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <InfoCard icon={Globe} label="СТРАНА" value={selectedOpp.location} />
                    <InfoCard icon={Briefcase} label="ФОРМАТ" value={selectedOpp.format} />
                    <InfoCard icon={Clock} label="ДЛИТЕЛЬНОСТЬ" value={selectedOpp.duration} />
                    <InfoCard icon={Briefcase} label="СТОИМОСТЬ" value={selectedOpp.cost} />
                    <InfoCard icon={GraduationCapUI} label="КЛАССЫ" value={selectedOpp.grades} />
                    <InfoCard icon={Trophy} label="УРОВЕНЬ" value={selectedOpp.level} />
                  </div>

                  {/* Tags */}
                  <div className="flex flex-col gap-3">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Теги</div>
                    <div className="flex flex-wrap gap-2">
                      {selectedOpp.tags.map((tag) => (
                        <span key={tag} className="rounded-lg bg-blue-50 px-3 py-1.5 text-[10px] font-bold text-[#1A4D9C]">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* About */}
                  <section className="rounded-2xl bg-blue-50/50 p-6">
                    <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">О программе</h3>
                    <p className="text-sm text-foreground leading-relaxed">
                      {selectedOpp.description}
                    </p>
                  </section>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center gap-3 bg-background p-6 border-t border-border shrink-0">
                <button className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#1A4D9C] py-4 text-sm font-bold text-white shadow-lg transition-all hover:scale-[1.01] hover:shadow-2xl">
                  <Calendar className="h-5 w-5" /> Создать дедлайн
                </button>
                <button className="rounded-xl border border-border bg-background p-4 text-muted-foreground hover:bg-accent transition-all shadow-md">
                  <Bookmark className="h-5 w-5" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterDropdown({ label }: { label: string }) {
  return (
    <button className="flex items-center gap-3 rounded-2xl bg-background border border-border px-5 py-3.5 text-sm font-medium hover:bg-accent transition-all shadow-sm">
      {label} <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  );
}

function Param({ icon: Icon, label }: { icon: any, label: string }) {
  return (
    <div className="flex items-center gap-3 text-xs font-semibold text-muted-foreground">
      <Icon className="h-4 w-4 opacity-60" /> {label}
    </div>
  );
}

function InfoCard({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
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
