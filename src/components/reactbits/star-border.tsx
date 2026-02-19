"use client";

import type React from "react";

type StarBorderProps<T extends React.ElementType> =
  React.ComponentPropsWithoutRef<T> & {
    as?: T;
    className?: string;
    children?: React.ReactNode;
    color?: string;
    speed?: React.CSSProperties["animationDuration"];
    thickness?: number;
  };

export default function StarBorder<T extends React.ElementType = "button">({
  as,
  className = "",
  color = "white",
  speed = "6s",
  thickness = 1,
  children,
  ...rest
}: StarBorderProps<T>) {
  const Component = as || "button";

  return (
    <Component
      className={`relative inline-block overflow-hidden rounded-[20px] ${className}`}
      {...(rest as Record<string, unknown>)}
      style={{
        padding: `${thickness}px 0`,
        ...((rest as Record<string, unknown>).style as React.CSSProperties),
      }}
    >
      <div
        className="absolute right-[-250%] bottom-[-11px] z-0 h-[50%] w-[300%] animate-star-movement-bottom rounded-full opacity-70"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 10%)`,
          animationDuration: speed,
        }}
      />
      <div
        className="absolute top-[-10px] left-[-250%] z-0 h-[50%] w-[300%] animate-star-movement-top rounded-full opacity-70"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 10%)`,
          animationDuration: speed,
        }}
      />
      <div className="relative z-[1] rounded-[20px] border border-border bg-card px-6 py-4 text-center text-foreground">
        {children}
      </div>
    </Component>
  );
}
