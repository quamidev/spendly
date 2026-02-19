"use client";

import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

interface FadeContentProps {
  children: React.ReactNode;
  blur?: boolean;
  duration?: number;
  delay?: number;
  threshold?: number;
  className?: string;
  direction?: "up" | "down" | "none";
  distance?: number;
}

export default function FadeContent({
  children,
  blur = false,
  duration = 0.8,
  delay = 0,
  threshold = 0.1,
  className = "",
  direction = "up",
  distance = 30,
}: FadeContentProps) {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) {
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(ref.current as Element);
        }
      },
      { threshold }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);

  let yFrom = 0;
  if (direction === "up") {
    yFrom = distance;
  } else if (direction === "down") {
    yFrom = -distance;
  }

  return (
    <motion.div
      animate={
        inView
          ? { opacity: 1, y: 0, filter: "blur(0px)" }
          : { opacity: 0, y: yFrom, filter: blur ? "blur(10px)" : "blur(0px)" }
      }
      className={className}
      initial={{
        opacity: 0,
        y: yFrom,
        filter: blur ? "blur(10px)" : "blur(0px)",
      }}
      ref={ref}
      transition={{ duration, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
