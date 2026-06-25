import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { STATS } from "../../lib/constants";
import { AnimatedNumber } from "../shared/AnimatedNumber";
import { supabase } from "../../lib/supabase";

export function Stats() {
  const [dynamicStats, setDynamicStats] = useState(STATS);

  useEffect(() => {
    async function fetchStats() {
      try {
        // Try to get count of profiles if table exists
        const { count, error } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true });

        if (!error && count !== null && count > 1200) {
          setDynamicStats(prev => 
            prev.map(stat => 
              stat.label.includes("учеников") 
                ? { ...stat, value: count } 
                : stat
            )
          );
        }
      } catch (err) {
        console.log("Could not fetch dynamic stats, using defaults");
      }
    }
    fetchStats();
  }, []);

  return (
    <section className="relative py-10 bg-[var(--bg-card)]/40 border-y border-[var(--border)] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 divide-y-0 divide-x-0 md:divide-x divide-[var(--border)]">
          {dynamicStats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="flex flex-col items-center justify-center text-center px-4 py-2"
            >
              <div className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)] font-display flex items-baseline gap-0.5">
                <AnimatedNumber
                  target={stat.value}
                  suffix={stat.suffix}
                  isFloat={stat.isFloat}
                />
              </div>
              <div className="text-xs sm:text-sm text-[var(--text-secondary)] mt-2 font-medium">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
