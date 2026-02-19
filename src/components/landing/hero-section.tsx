"use client";

import { useTranslations } from "next-intl";
import Aurora from "@/components/reactbits/aurora";
import BlurText from "@/components/reactbits/blur-text";
import RotatingText from "@/components/reactbits/rotating-text";
import ShinyText from "@/components/reactbits/shiny-text";
import StarBorder from "@/components/reactbits/star-border";
import { SpendlyLogo } from "@/components/spendly-logo";

export function HeroSection() {
  const t = useTranslations("Landing");

  const rotatingWords = t("hero.rotatingWords").split(",");

  return (
    <section className="relative flex min-h-svh w-full flex-col items-center justify-center overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <Aurora
          amplitude={1.2}
          blend={0.6}
          colorStops={["#e84c3d", "#ff8a65", "#e84c3d"]}
          speed={0.5}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8 px-6 text-center">
        <SpendlyLogo className="text-5xl md:text-7xl" />

        <BlurText
          animateBy="words"
          className="max-w-3xl justify-center font-bold text-3xl text-foreground tracking-tight md:text-5xl lg:text-6xl"
          delay={100}
          text={t("hero.headline")}
        />

        <div className="flex items-center gap-2 text-muted-foreground text-xl md:text-2xl">
          <RotatingText
            mainClassName="overflow-hidden rounded-lg bg-primary/10 px-3 py-1 text-primary font-semibold"
            rotationInterval={2500}
            staggerDuration={0.025}
            staggerFrom="last"
            texts={rotatingWords}
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
          />
        </div>

        <ShinyText
          className="max-w-2xl text-base text-muted-foreground md:text-lg"
          color="oklch(0.55 0.016 286)"
          shineColor="oklch(0.71 0.194 13)"
          speed={3}
          text={t("hero.subtitle")}
        />

        <StarBorder
          as="a"
          className="mt-4"
          color="oklch(0.645 0.246 16.439)"
          href="/auth/login"
          speed="5s"
        >
          <span className="font-semibold text-lg">{t("hero.cta")}</span>
        </StarBorder>
      </div>
    </section>
  );
}
