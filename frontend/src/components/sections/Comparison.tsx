import { useState } from "react";
import { motion } from "framer-motion";
import { COMPARISONS } from "../../lib/constants";
import { SectionHeader } from "../shared/SectionHeader";

export function Comparison() {
  const [activeCard, setActiveCard] = useState<number | null>(null);

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "Reach":
        return "text-red-400 bg-red-500/10 border-red-500/20";
      case "Match":
        return "text-blue-400 bg-blue-500/10 border-blue-500/20";
      case "Safety":
        return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      default:
        return "text-[var(--text-secondary)] bg-[var(--bg-base)] border-[var(--border)]";
    }
  };

  return (
    <section id="comparison" className="relative py-20 lg:py-28 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeader
          badge="Сравнение"
          title="Как твой профиль соотносится со средним поступившим"
          subtitle="Сравните ваши текущие показатели с требованиями ведущих мировых вузов на основе реальной статистики."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {COMPARISONS.map((item, idx) => {
            const isActive = activeCard === idx;
            return (
              <motion.div
                key={item.uni}
                onMouseEnter={() => setActiveCard(idx)}
                onMouseLeave={() => setActiveCard(null)}
                className={`relative p-6 lg:p-8 premium-card flex flex-col justify-between overflow-hidden cursor-pointer transition-all duration-300 ${
                  isActive
                    ? "border-[var(--accent)] shadow-[0_0_30px_rgba(59,130,246,0.15)]"
                    : ""
                }`}
              >
                {/* Gradient Accent Overlay on active card */}
                {isActive && (
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent-glow)] rounded-full blur-2xl pointer-events-none" />
                )}

                <div>
                  {/* Uni Header */}
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-2xl font-bold font-display text-[var(--text-primary)]">
                        {item.uni}
                      </h3>
                      <span className={`inline-block text-xs px-2.5 py-0.5 rounded border mt-2 font-medium ${getTierColor(item.tier)}`}>
                        {item.tier}
                      </span>
                    </div>
                  </div>

                  {/* Progress bars metrics */}
                  <div className="space-y-4 mb-8">
                    {Object.entries(item.metrics).map(([metric, val]) => (
                      <div key={metric}>
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-[var(--text-secondary)]">{metric}</span>
                          <span className="font-semibold text-[var(--text-primary)] font-mono-custom">{val}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-[var(--bg-base)] rounded-full overflow-hidden border border-[var(--border)]">
                          <motion.div
                            initial={{ scaleX: 0 }}
                            whileInView={{ scaleX: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className={`h-full rounded-full origin-left transition-colors duration-300 ${
                              isActive
                                ? "bg-gradient-to-r from-[var(--accent)] to-[var(--accent-soft)]"
                                : "bg-[var(--text-muted)]"
                            }`}
                            style={{ width: `${val}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Tip Bottom Wrapper */}
                <div className={`mt-6 p-4 rounded-xl border border-[var(--border)] transition-colors ${
                  isActive ? "bg-[var(--bg-base)]/80 border-[var(--border-accent)]" : "bg-[var(--bg-base)]/40"
                }`}>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--accent)] mb-1.5 uppercase tracking-wider">
                    <span>✦ AI Рекомендация</span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {item.tip}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
