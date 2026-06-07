import { motion } from "framer-motion";
import { UserCircle, GraduationCap, CheckSquare, ArrowRight } from "lucide-react";
import { STEPS } from "../../lib/constants";
import { SectionHeader } from "../shared/SectionHeader";

const iconsMap: Record<string, React.ComponentType<any>> = {
  UserCircle: UserCircle,
  GraduationCap: GraduationCap,
  CheckSquare: CheckSquare,
};

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-20 lg:py-28 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <SectionHeader
          badge="Процесс"
          title="Три шага — и у тебя есть план"
        />

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch relative">
          {STEPS.map((step, idx) => {
            const Icon = iconsMap[step.icon] || UserCircle;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: idx * 0.15, ease: [0.22, 1, 0.36, 1] }}
                className="group relative rounded-2xl border border-[var(--border)] bg-[var(--bg-card)]/50 backdrop-blur p-8 hover:bg-[var(--bg-card-hover)] hover:-translate-y-1 transition-all duration-300 flex flex-col items-start"
              >
                {/* Accent glow on hover */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[var(--accent-glow)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                {/* Step badge */}
                <span className="text-xs font-bold font-mono-custom text-[var(--accent)] mb-4 uppercase tracking-wider">
                  {step.step}
                </span>

                {/* Icon wrapper */}
                <div className="p-3 rounded-xl bg-[var(--bg-base)] border border-[var(--border)] mb-6 text-[var(--accent)] group-hover:scale-110 transition-transform">
                  <Icon className="h-6 w-6" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3">
                  {step.title}
                </h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed flex-1">
                  {step.description}
                </p>

                {/* Navigation arrow between desktop cards */}
                {idx < 2 && (
                  <div className="hidden md:flex absolute top-1/2 -translate-y-1/2 right-[-20px] z-10 text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors translate-x-[2px]">
                    <ArrowRight className="h-6 w-6" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
