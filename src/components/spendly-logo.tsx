interface SpendlyLogoProps {
  className?: string;
}

export function SpendlyLogo({ className }: SpendlyLogoProps) {
  return (
    <span
      className={`relative inline-flex items-baseline font-extrabold text-lg tracking-tighter sm:text-xl ${className ?? ""}`}
    >
      <span className="text-primary">$</span>
      pendly
      <svg
        aria-hidden="true"
        className="absolute -bottom-[0.25em] left-0 h-[0.15em] w-full"
        preserveAspectRatio="none"
        viewBox="0 0 50 10"
      >
        <path
          className="fill-none stroke-3 stroke-primary [stroke-linecap:round] [stroke-linejoin:round]"
          d="M0,6 L15,6 L20,2 L25,6 L30,2 L35,6 L50,6"
        />
      </svg>
    </span>
  );
}
