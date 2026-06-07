import { motion } from "framer-motion";
import { Sparkles, Globe, Calendar, FolderOpen, Trophy } from "lucide-react";
import { FEATURES } from "../../lib/constants";
import { SectionHeader } from "../shared/SectionHeader";

const iconsMap: Record<string, React.ComponentType<any>> = {
  Sparkles: Sparkles,
  Globe: Globe,
  Calendar: Calendar,
  FolderOpen: FolderOpen,
  Trophy: Trophy,
};

export function Features() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <section id="features" className="relative py-20 lg:py-28 bg-[var(--bg-card)]/20 border-y border-[var(--border)] overflow-hidden">
      {/* Subtle mesh background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[var(--accent-glow)] blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6">
        <SectionHeader
          badge="Возможности"
          title="Всё для сильной заявки — в одном месте"
        />

        {/* Bento Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Large Card: AI Evaluation */}
          {FEATURES.filter((f) => f.isLarge).map((feat) => {
            const Icon = iconsMap[feat.icon] || Sparkles;
            return (
              <motion.div
                key={feat.id}
                variants={itemVariants}
                className="lg:col-span-2 group relative rounded-2xl border border-[var(--border)] bg-[var(--bg-card)]/80 backdrop-blur p-8 lg:p-10 flex flex-col justify-between overflow-hidden min-h-[420px] hover:border-[var(--border-accent)] transition-all duration-300"
              >
                {/* Glow Overlay */}
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-gradient-to-br from-[var(--accent-glow)] to-transparent rounded-full blur-2xl pointer-events-none" />

                <div>
                  <div className="p-3 rounded-xl bg-[var(--bg-base)] border border-[var(--border)] mb-6 text-[var(--accent)] inline-block group-hover:scale-105 transition-transform">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-3">
                    {feat.title}
                  </h3>
                  <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed max-w-xl">
                    {feat.description}
                  </p>
                </div>

                {/* Inner mockup visualization */}
                <div className="mt-8 bg-[var(--bg-base)]/80 border border-[var(--border)] rounded-xl p-5 relative overflow-hidden group-hover:translate-y-[-4px] transition-transform duration-300">
                  <div className="flex justify-between items-center pb-3 border-b border-[var(--border)] mb-4">
                    <span className="text-xs font-semibold text-[var(--text-primary)]">Сравнение профилей</span>
                    <span className="text-[10px] font-bold font-mono-custom text-[var(--accent)] bg-[var(--accent-glow)] px-2 py-0.5 rounded">
                      CS Major
                    </span>
                  </div>
                  <div className="space-y-3">
                    {/* MIT Comparison Bar */}
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-[var(--text-primary)] font-medium">Твой профиль</span>
                        <span className="font-semibold font-mono-custom text-[var(--accent)]">72%</span>
                      </div>
                      <div className="h-1.5 w-full bg-[var(--bg-card)] rounded-full overflow-hidden">
                        <div className="h-full bg-[var(--accent)] rounded-full" style={{ width: "72%" }} />
                      </div>
                    </div>
                    {/* Average Admitted MIT */}
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-[var(--text-secondary)]">Средний профиль MIT</span>
                        <span className="font-semibold font-mono-custom text-[var(--text-secondary)]">88%</span>
                      </div>
                      <div className="h-1.5 w-full bg-[var(--bg-card)] rounded-full overflow-hidden">
                        <div className="h-full bg-[var(--accent-secondary)] rounded-full" style={{ width: "88%" }} />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* Right Smaller Cards */}
          <div className="lg:col-span-1 grid grid-cols-1 gap-6">
            {FEATURES.filter((f) => !f.isLarge).map((feat) => {
              const Icon = iconsMap[feat.icon] || Globe;
              return (
                <motion.div
                  key={feat.id}
                  variants={itemVariants}
                  className="group relative rounded-2xl border border-[var(--border)] bg-[var(--bg-card)]/50 backdrop-blur p-6 hover:bg-[var(--bg-card-hover)] hover:border-[var(--border-accent)] transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="p-2.5 rounded-lg bg-[var(--bg-base)] border border-[var(--border)] mb-4 text-[var(--accent)] inline-block group-hover:scale-105 transition-transform">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">
                      {feat.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                      {feat.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
