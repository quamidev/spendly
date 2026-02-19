"use client";

import { useTranslations } from "next-intl";
import GradientText from "@/components/reactbits/gradient-text";
import Magnet from "@/components/reactbits/magnet";
import StarBorder from "@/components/reactbits/star-border";

export function CtaSection() {
  const t = useTranslations("Landing.cta");

  return (
    <section className="w-full bg-muted/30 px-6 py-20 md:py-28">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-8 text-center">
        <GradientText
          animationSpeed={4}
          className="font-bold text-3xl tracking-tight md:text-4xl lg:text-5xl"
          colors={["#e84c3d", "#ff8a65", "#e84c3d"]}
        >
          {t("headline")}
        </GradientText>

        <Magnet magnetStrength={3} padding={80}>
          <StarBorder
            as="a"
            color="oklch(0.645 0.246 16.439)"
            href="/auth/login"
            speed="5s"
          >
            <span className="font-semibold text-lg">{t("button")}</span>
          </StarBorder>
        </Magnet>
      </div>
    </section>
  );
}
