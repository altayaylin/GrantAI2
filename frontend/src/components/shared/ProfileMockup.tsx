import { CheckCircle2, Circle, GraduationCap, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export function ProfileMockup() {
  const tasks = [
    { title: "Загрузить SAT Math (780)", done: true },
    { title: "Эссе Common App — Черновик 1", done: false },
    { title: "Рекомендация по физике", done: false },
  ];

  const universities = [
    { name: "MIT", tier: "Reach", color: "text-red-400 bg-red-500/10 border-red-500/20" },
    { name: "ETH Zürich", tier: "Match", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
    { name: "TU Delft", tier: "Match", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
    { name: "Nazarbayev University", tier: "Safety", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  ];

  return (
    <div className="relative w-full max-w-[480px] mx-auto lg:ml-auto">
      {/* Background glow effects */}
      <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[var(--accent)] to-[var(--accent-secondary)] opacity-30 blur-xl group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
      
      {/* Main Glass Dashboard Card */}
      <div className="float-animation relative rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-2xl overflow-hidden">
        {/* Glow circle overlay */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent-glow)] rounded-full blur-2xl pointer-events-none" />
        
        {/* Header User profile */}
        <div className="flex items-center justify-between pb-5 border-b border-[var(--border)] mb-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-[var(--accent)] to-[var(--accent-secondary)] flex items-center justify-center text-white font-bold text-sm">
              AA
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[var(--text-primary)]">Altay Aylin</h4>
              <p className="text-xs text-[var(--text-secondary)]">12 класс · CS Major</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--accent-glow)] border border-[var(--border-accent)]">
            <Sparkles className="h-3.5 w-3.5 text-[var(--accent)]" />
            <span className="text-xs font-bold font-mono-custom text-[var(--accent)]">AI: B+</span>
          </div>
        </div>

        {/* Profile completion bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="text-[var(--text-secondary)]">Готовность профиля</span>
            <span className="font-semibold text-[var(--accent)] font-mono-custom">72%</span>
          </div>
          <div className="h-2 w-full bg-[var(--bg-base)] rounded-full overflow-hidden border border-[var(--border)]">
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
              className="h-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-soft)] rounded-full origin-left"
              style={{ width: "72%" }}
            />
          </div>
        </div>

        {/* Tasks list mockup */}
        <div className="mb-6">
          <h5 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">Ближайшие задачи</h5>
          <div className="space-y-2.5">
            {tasks.map((task, idx) => (
              <div key={idx} className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-[var(--bg-base)]/50 border border-[var(--border)]">
                {task.done ? (
                  <CheckCircle2 className="h-4 w-4 text-[var(--success)] shrink-0" />
                ) : (
                  <Circle className="h-4 w-4 text-[var(--text-muted)] shrink-0" />
                )}
                <span className={`text-xs ${task.done ? "line-through text-[var(--text-muted)]" : "text-[var(--text-primary)]"}`}>
                  {task.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Universities list mockup */}
        <div>
          <h5 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">Подборка вузов</h5>
          <div className="space-y-2">
            {universities.map((uni, idx) => (
              <div key={idx} className="flex items-center justify-between px-3 py-2 rounded-lg bg-[var(--bg-base)]/30 border border-[var(--border)] hover:bg-[var(--bg-card-hover)] transition-colors">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-[var(--text-secondary)]" />
                  <span className="text-xs font-medium text-[var(--text-primary)]">{uni.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded border ${uni.color} font-medium`}>
                    {uni.tier}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
