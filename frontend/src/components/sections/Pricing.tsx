import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { Check, ArrowRight } from "lucide-react";
import { SectionHeader } from "../shared/SectionHeader";

export function Pricing() {
  const freeFeatures = [
    "Профиль и портфолио",
    "До 5 университетов в списке",
    "Базовая AI оценка (3 в месяц)",
    "Дедлайны и задачи",
  ];

  const proFeatures = [
    "Всё из Free",
    "Безлимит AI оценок",
    "Детальное сравнение с поступившими",
    "Подбор активностей под профиль",
    "AI Copilot — советник в чате",
    "Приоритетная поддержка",
  ];

  return (
    <section id="pricing" className="relative py-20 lg:py-28 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeader
          badge="Тарифы"
          title="Начни бесплатно. Усиль, когда будешь готов."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
          {/* Free Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="group relative p-8 lg:p-10 premium-card flex flex-col justify-between"
          >
            <div>
              <h3 className="text-xl font-bold text-[var(--text-primary)]">Free</h3>
              <p className="text-xs text-[var(--text-secondary)] mt-2">Идеально для старта и ознакомления с возможностями платформы</p>
              
              <div className="my-6">
                <span className="text-4xl font-extrabold text-[var(--text-primary)] font-mono-custom">0 ₸</span>
                <span className="text-xs text-[var(--text-secondary)] ml-2">/ всегда бесплатно</span>
              </div>

              <ul className="space-y-3.5 mb-8">
                {freeFeatures.map((feat) => (
                  <li key={feat} className="flex items-start gap-2.5 text-xs text-[var(--text-secondary)]">
                    <Check className="h-4 w-4 text-[var(--accent)] shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Link
              to="/auth"
              className="w-full text-center bg-[var(--bg-base)] text-[var(--text-primary)] border border-[var(--border)] font-semibold py-3.5 rounded-xl transition-all hover:bg-[var(--bg-card-hover)] active:scale-[0.98] flex items-center justify-center gap-1.5"
            >
              Начать бесплатно
            </Link>
          </motion.div>

          {/* Pro Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="group relative rounded-2xl border-2 border-[var(--accent)] bg-[var(--bg-card)] p-8 lg:p-10 flex flex-col justify-between shadow-[0_0_40px_rgba(79,142,247,0.15)] overflow-hidden"
          >
            {/* Popular Badge */}
            <div className="absolute top-4 right-4 bg-gradient-to-r from-[var(--accent)] to-[var(--accent-secondary)] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Популярный
            </div>

            <div>
              <h3 className="text-xl font-bold text-[var(--text-primary)]">Pro</h3>
              <p className="text-xs text-[var(--text-secondary)] mt-2">Полный набор инструментов для подготовки сильной заявки</p>
              
              <div className="my-6">
                <span className="text-4xl font-extrabold text-[var(--text-primary)] font-mono-custom">2 990 ₸</span>
                <span className="text-xs text-[var(--text-secondary)] ml-2">/ месяц</span>
              </div>

              <ul className="space-y-3.5 mb-8">
                {proFeatures.map((feat) => (
                  <li key={feat} className="flex items-start gap-2.5 text-xs text-[var(--text-primary)]">
                    <Check className="h-4 w-4 text-[var(--accent)] shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Link
              to="/auth"
              className="w-full text-center bg-[var(--accent)] text-white font-semibold py-3.5 rounded-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_0_24px_rgba(79,142,247,0.4)] active:scale-[0.98] flex items-center justify-center gap-1.5"
            >
              Попробовать Pro <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
