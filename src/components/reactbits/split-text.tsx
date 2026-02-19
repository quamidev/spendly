"use client";

import { motion, type Transition } from "motion/react";
import { useEffect, useRef, useState } from "react";

interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  threshold?: number;
  rootMargin?: string;
  animationFrom?: Record<string, string | number>;
  animationTo?: Record<string, string | number>;
  easing?: Transition["ease"];
  duration?: number;
  tag?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span";
  onAnimationComplete?: () => void;
}

export default function SplitText({
  text,
  className = "",
  delay = 50,
  threshold = 0.1,
  rootMargin = "-100px",
  animationFrom = { opacity: 0, y: 40 },
  animationTo = { opacity: 1, y: 0 },
  easing = "easeOut",
  duration = 0.5,
  tag = "p",
  onAnimationComplete,
}: SplitTextProps) {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const characters = text.split("");

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
      { threshold, rootMargin }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  const Tag = tag as React.ElementType;

  return (
    <Tag
      className={`inline-flex flex-wrap overflow-hidden ${className}`}
      ref={ref}
    >
      {characters.map((char, index) => {
        const transition: Transition = {
          duration,
          delay: (index * delay) / 1000,
          ease: easing,
        };

        return (
          <motion.span
            animate={inView ? animationTo : animationFrom}
            initial={animationFrom}
            key={`${char}-${index}`}
            onAnimationComplete={
              index === characters.length - 1 ? onAnimationComplete : undefined
            }
            style={{
              display: "inline-block",
              willChange: "transform, opacity",
            }}
            transition={transition}
          >
            {char === " " ? "\u00A0" : char}
          </motion.span>
        );
      })}
    </Tag>
  );
}
