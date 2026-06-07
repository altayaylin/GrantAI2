import { useEffect, useState, useRef } from "react";
import { useInView } from "framer-motion";

interface AnimatedNumberProps {
  target: number;
  suffix?: string;
  isFloat?: boolean;
}

export function AnimatedNumber({ target, suffix = "", isFloat = false }: AnimatedNumberProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (!isInView) return;
    
    let startTime: number | null = null;
    const duration = 1500; // 1.5 seconds

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      if (isFloat) {
        // Handle floats (e.g. 4.8)
        const current = progress * target;
        setCount(Number(current.toFixed(1)) as any);
      } else {
        const current = Math.floor(progress * target);
        setCount(current);
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(target as any);
      }
    };

    requestAnimationFrame(animate);
  }, [isInView, target, isFloat]);

  return (
    <span ref={ref} className="font-mono-custom font-bold">
      {count}
      {suffix}
    </span>
  );
}
