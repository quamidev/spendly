"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import FadeContent from "@/components/reactbits/fade-content";
import GradientText from "@/components/reactbits/gradient-text";
import SplitText from "@/components/reactbits/split-text";
import StarBorder from "@/components/reactbits/star-border";
import { Button } from "@/components/ui/button";

export function PricingSection() {
  const t = useTranslations("Landing.pricing");

  const freeFeatures = t("free.features").split(",");
  const proFeatures = t("pro.features").split(",");

  return (
    <section className="w-full px-6 py-20 md:py-28">
      <div className="mx-auto max-w-4xl">
        <div className="mb-16 flex justify-center">
          <SplitText
            className="font-bold text-3xl text-foreground tracking-tight md:text-4xl lg:text-5xl"
            delay={30}
            tag="h2"
            text={t("title")}
          />
        </div>

        <FadeContent blur delay={0.2} duration={0.6}>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* Free Plan */}
            <div className="flex flex-col rounded-xl border border-border bg-card p-8">
              <h3 className="font-bold text-2xl text-foreground">
                {t("free.name")}
              </h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="font-bold text-4xl text-foreground">
                  {t("free.price")}
                </span>
                <span className="text-muted-foreground">
                  {t("free.period")}
                </span>
              </div>
              <ul className="mt-8 flex flex-col gap-3">
                {freeFeatures.map((feature) => (
                  <li className="flex items-center gap-3" key={feature}>
                    <Check className="h-4 w-4 shrink-0 text-primary" />
                    <span className="text-muted-foreground text-sm">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-8">
                <Button asChild className="w-full" variant="outline">
                  <Link href="/auth/login">{t("cta")}</Link>
                </Button>
              </div>
            </div>

            {/* Pro Plan */}
            <StarBorder
              as="div"
              className="w-full"
              color="oklch(0.645 0.246 16.439)"
              speed="8s"
            >
              <div className="flex flex-col">
                <div className="flex items-center gap-3">
                  <GradientText
                    animationSpeed={4}
                    className="font-bold text-2xl"
                    colors={["#e84c3d", "#ff8a65", "#e84c3d"]}
                  >
                    {t("pro.name")}
                  </GradientText>
                </div>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="font-bold text-4xl text-foreground">
                    {t("pro.price")}
                  </span>
                  <span className="text-muted-foreground">
                    {t("pro.period")}
                  </span>
                </div>
                <ul className="mt-8 flex flex-col gap-3">
                  {proFeatures.map((feature) => (
                    <li className="flex items-center gap-3" key={feature}>
                      <Check className="h-4 w-4 shrink-0 text-primary" />
                      <span className="text-muted-foreground text-sm">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="pt-8">
                  <Button asChild className="w-full">
                    <Link href="/auth/login">{t("cta")}</Link>
                  </Button>
                </div>
              </div>
            </StarBorder>
          </div>
        </FadeContent>
      </div>
    </section>
  );
}
