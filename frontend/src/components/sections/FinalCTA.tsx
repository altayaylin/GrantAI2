import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

export function FinalCTA() {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden border-b border-[var(--border)]">
      {/* Intense mesh gradient in background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-r from-[var(--accent)] to-[var(--accent-secondary)] opacity-15 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-display tracking-tight text-[var(--text-primary)] leading-tight">
            Твои конкуренты уже готовятся.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[var(--text-secondary)]">
            Начни сегодня — это бесплатно.
          </p>

          <div className="mt-8 flex flex-col items-center gap-4">
            <Link
              to="/auth"
              className="bg-[var(--accent)] text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_0_24px_rgba(79,142,247,0.4)] active:scale-[0.98] flex items-center gap-2"
            >
              Создать профиль <ArrowRight className="h-4 w-4" />
            </Link>
            <span className="text-xs text-[var(--text-muted)] mt-2">
              Регистрация занимает 2 минуты. Карта не нужна.
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
