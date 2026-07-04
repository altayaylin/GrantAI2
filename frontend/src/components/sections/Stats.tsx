import { motion } from "framer-motion";
import { Calendar, ShieldCheck, Target } from "lucide-react";

export function Stats() {
  const cards = [
    {
      title: "Все дедлайны в одном месте",
      desc: "Активности и вузы автоматически попадают в календарь.",
      icon: Calendar,
    },
    {
      title: "Честная оценка профиля",
      desc: "Понятно, где ты силён и что усилить.",
      icon: ShieldCheck,
    },
    {
      title: "Подбор под твой мейджор",
      desc: "Вузы и активности, релевантные именно твоему направлению.",
      icon: Target,
    },
  ];

  return (
    <section className="relative py-16 border-y border-[var(--border)] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {cards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="premium-card p-6 flex items-start gap-4"
              >
                <div className="p-2.5 rounded-xl bg-[var(--bg-base)] border border-[var(--border)] text-[var(--accent)] shrink-0">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[var(--text-primary)] mb-1">
                    {card.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                    {card.desc}
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
