"use client";

import { useRef, useState } from "react";

interface SpotlightCardProps extends React.PropsWithChildren {
  className?: string;
  spotlightColor?: string;
}

export default function SpotlightCard({
  children,
  className = "",
  spotlightColor = "rgba(255, 255, 255, 0.25)",
}: SpotlightCardProps) {
  const divRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (!divRef.current || isFocused) {
      return;
    }
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: decorative spotlight hover effect
    // biome-ignore lint/a11y/noNoninteractiveElementInteractions: decorative spotlight hover effect
    <div
      className={`relative overflow-hidden rounded-xl border border-border bg-card p-8 ${className}`}
      onMouseEnter={() => setOpacity(0.6)}
      onMouseLeave={() => {
        setIsFocused(false);
        setOpacity(0);
      }}
      onMouseMove={handleMouseMove}
      ref={divRef}
    >
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-500 ease-in-out"
        style={{
          opacity,
          background: `radial-gradient(circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 80%)`,
        }}
      />
      {children}
    </div>
  );
}
