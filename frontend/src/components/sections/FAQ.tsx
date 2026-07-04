import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { FAQS } from "../../lib/constants";
import { SectionHeader } from "../shared/SectionHeader";

export function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section id="faq" className="relative py-20 lg:py-28 bg-[var(--bg-card)]/10 border-y border-[var(--border)] overflow-hidden">
      <div className="max-w-4xl mx-auto px-6">
        <SectionHeader
          badge="Вопросы"
          title="Часто задаваемые вопросы"
        />

        <div className="space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden transition-all duration-300 hover:border-[var(--border-accent)]"
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full flex items-center justify-between p-5 text-left text-sm sm:text-base font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]/30 transition-colors"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-[var(--text-secondary)] transition-transform duration-300 ${
                      isOpen ? "rotate-180 text-[var(--accent)]" : ""
                    }`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="px-5 pb-5 pt-0 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed border-t border-[var(--border)]/30">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
