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
      {/* Gradient Mesh Glow Background */}
      <div className="absolute top-[-100px] right-[-100px] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[rgba(79,142,247,0.12)] to-transparent blur-3xl pointer-events-none" />
      <div className="absolute top-[200px] left-[-150px] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-[rgba(123,110,246,0.1)] to-transparent blur-3xl pointer-events-none" />

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
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-display tracking-tight text-[var(--text-primary)] leading-[1.1]"
          >
            Поступи в топовый вуз. <br />
            <span className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-secondary)] bg-clip-text text-transparent">
              Без хаоса и гадания.
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            variants={itemVariants}
            className="mt-6 text-base sm:text-lg text-[var(--text-secondary)] max-w-xl leading-relaxed"
          >
            GrantAI анализирует твой профиль, подбирает университеты и составляет
            чёткий план действий — так, чтобы ты точно знал, что делать завтра.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="mt-8 flex flex-wrap gap-4"
          >
            <Link
              to="/auth"
              className="bg-[var(--accent)] text-white font-semibold px-6 py-3.5 rounded-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_0_24px_rgba(79,142,247,0.4)] active:scale-[0.98] flex items-center gap-2"
            >
              Начать бесплатно <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#how-it-works"
              className="bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border)] font-semibold px-6 py-3.5 rounded-xl transition-all hover:bg-[var(--bg-card-hover)] active:scale-[0.98] flex items-center gap-2"
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
              Уже используют <strong className="text-[var(--text-primary)]">1 200+ учеников</strong> из Казахстана
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
