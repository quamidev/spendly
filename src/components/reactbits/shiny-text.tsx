"use client";

import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useTransform,
} from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

interface ShinyTextProps {
  text: string;
  disabled?: boolean;
  speed?: number;
  className?: string;
  color?: string;
  shineColor?: string;
  spread?: number;
  yoyo?: boolean;
  pauseOnHover?: boolean;
  direction?: "left" | "right";
  delay?: number;
}

export default function ShinyText({
  text,
  disabled = false,
  speed = 2,
  className = "",
  color = "#b5b5b5",
  shineColor = "#ffffff",
  spread = 120,
  yoyo = false,
  pauseOnHover = false,
  direction = "left",
  delay = 0,
}: ShinyTextProps) {
  const [isPaused, setIsPaused] = useState(false);
  const progress = useMotionValue(0);
  const elapsedRef = useRef(0);
  const lastTimeRef = useRef<number | null>(null);
  const directionRef = useRef(direction === "left" ? 1 : -1);

  const animationDuration = speed * 1000;
  const delayDuration = delay * 1000;

  const computeYoyoProgress = useCallback(
    (elapsed: number): number => {
      const cycleDuration = animationDuration + delayDuration;
      const fullCycle = cycleDuration * 2;
      const cycleTime = elapsed % fullCycle;
      const isForward = directionRef.current === 1;

      if (cycleTime < animationDuration) {
        const p = (cycleTime / animationDuration) * 100;
        return isForward ? p : 100 - p;
      }
      if (cycleTime < cycleDuration) {
        return isForward ? 100 : 0;
      }
      if (cycleTime < cycleDuration + animationDuration) {
        const reverseTime = cycleTime - cycleDuration;
        const p = 100 - (reverseTime / animationDuration) * 100;
        return isForward ? p : 100 - p;
      }
      return isForward ? 0 : 100;
    },
    [animationDuration, delayDuration]
  );

  const computeLinearProgress = useCallback(
    (elapsed: number): number => {
      const cycleDuration = animationDuration + delayDuration;
      const cycleTime = elapsed % cycleDuration;
      const isForward = directionRef.current === 1;

      if (cycleTime < animationDuration) {
        const p = (cycleTime / animationDuration) * 100;
        return isForward ? p : 100 - p;
      }
      return isForward ? 100 : 0;
    },
    [animationDuration, delayDuration]
  );

  useAnimationFrame((time) => {
    if (disabled || isPaused) {
      lastTimeRef.current = null;
      return;
    }

    if (lastTimeRef.current === null) {
      lastTimeRef.current = time;
      return;
    }

    const deltaTime = time - lastTimeRef.current;
    lastTimeRef.current = time;
    elapsedRef.current += deltaTime;

    const value = yoyo
      ? computeYoyoProgress(elapsedRef.current)
      : computeLinearProgress(elapsedRef.current);
    progress.set(value);
  });

  useEffect(() => {
    directionRef.current = direction === "left" ? 1 : -1;
    elapsedRef.current = 0;
    progress.set(0);
  }, [direction, progress]);

  const backgroundPosition = useTransform(
    progress,
    (p) => `${150 - p * 2}% center`
  );

  const handleMouseEnter = useCallback(() => {
    if (pauseOnHover) {
      setIsPaused(true);
    }
  }, [pauseOnHover]);

  const handleMouseLeave = useCallback(() => {
    if (pauseOnHover) {
      setIsPaused(false);
    }
  }, [pauseOnHover]);

  const gradientStyle: React.CSSProperties = {
    backgroundImage: `linear-gradient(${spread}deg, ${color} 0%, ${color} 35%, ${shineColor} 50%, ${color} 65%, ${color} 100%)`,
    backgroundSize: "200% auto",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    WebkitTextFillColor: "transparent",
  };

  return (
    <motion.span
      className={`inline-block ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ ...gradientStyle, backgroundPosition }}
    >
      {text}
    </motion.span>
  );
}
