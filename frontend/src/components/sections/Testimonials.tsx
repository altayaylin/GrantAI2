import { motion } from "framer-motion";
import { TESTIMONIALS } from "../../lib/constants";
import { SectionHeader } from "../shared/SectionHeader";

export function Testimonials() {
  return (
    <section id="testimonials" className="relative py-20 lg:py-28 bg-[var(--bg-card)]/10 border-y border-[var(--border)] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeader
          badge="Отзывы"
          title="Ученики, которые уже используют Naviuni"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {TESTIMONIALS.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: idx * 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="group relative rounded-2xl border border-[var(--border)] bg-[var(--bg-card)]/40 backdrop-blur p-6 lg:p-8 hover:bg-[var(--bg-card-hover)] hover:border-[var(--border-accent)] transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* 5 Stars Rating */}
                <div className="flex text-yellow-500 text-lg mb-4">
                  ★★★★★
                </div>
                {/* Quote Text */}
                <p className="text-sm sm:text-base text-[var(--text-primary)] italic leading-relaxed mb-6">
                  "{item.quote}"
                </p>
              </div>

              {/* Author info */}
              <div className="flex items-center gap-3.5 pt-4 border-t border-[var(--border)]">
                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-[var(--accent)] to-[var(--accent-secondary)] flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {item.initials}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[var(--text-primary)]">
                    {item.author}
                  </h4>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    {item.info}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
