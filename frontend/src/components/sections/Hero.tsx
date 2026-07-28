import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Play } from "lucide-react";
import { ProfileMockup } from "../shared/ProfileMockup";

export function Hero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <section className="relative min-h-screen flex items-center pt-28 lg:pt-36 pb-16 lg:pb-24 overflow-hidden">
      {/* Soft Accent Glow Behind Hero */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] rounded-full blur-[120px] pointer-events-none z-0" 
        style={{ backgroundImage: 'radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%)' }}
      />

      <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        {/* Hero Left Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="lg:col-span-7 flex flex-col justify-center text-left"
        >
          {/* Badge Pill */}
          <motion.div variants={itemVariants} className="mb-6 self-start">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-[var(--accent-glow)] text-[var(--accent)] border border-[var(--border-accent)]">
              ✦ AI-платформа для поступления за рубеж
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            variants={itemVariants}
            className="text-[36px] sm:text-[48px] lg:text-[64px] font-extrabold tracking-[-0.02em] text-[var(--text-primary)] leading-[1.1]"
          >
            Поступи в топовый вуз. <br />
            <span className="text-[var(--accent)]">
              Без хаоса и гадания.
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            variants={itemVariants}
            className="mt-6 text-[16px] sm:text-[17px] text-[var(--text-secondary)] max-w-xl leading-[1.6]"
          >
            Naviuni анализирует твой профиль, подбирает университеты и составляет
            чёткий план действий — так, чтобы ты точно знал, что делать завтра.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="mt-8 flex flex-wrap gap-4"
          >
            <Link
              to="/auth"
              className="bg-[var(--accent)] text-white font-semibold px-6 py-3.5 rounded-xl transition-all duration-200 md:hover:scale-[1.02] md:hover:shadow-[0_0_24px_var(--accent-glow)] active:scale-[0.98] flex items-center gap-2"
            >
              Начать бесплатно <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#how-it-works"
              className="bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border)] font-semibold px-6 py-3.5 rounded-xl transition-all md:hover:bg-[var(--bg-card-hover)] active:scale-[0.98] flex items-center gap-2"
            >
              Смотреть демо <Play className="h-4 w-4 fill-current text-[var(--text-secondary)]" />
            </a>
          </motion.div>

          {/* Social Proof */}
          <motion.div
            variants={itemVariants}
            className="mt-8 pt-8 border-t border-[var(--border)] flex items-center gap-3 text-sm text-[var(--text-secondary)]"
          >
            <div className="flex text-yellow-500 font-bold text-lg leading-none">
              ★★★★★
            </div>
            <span>
              Уже используют школьники из Казахстана для подготовки к поступлению
            </span>
          </motion.div>
        </motion.div>

        {/* Hero Right Visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          className="lg:col-span-5 relative w-full flex justify-center"
        >
          <ProfileMockup />
        </motion.div>
      </div>
    </section>
  );
}
