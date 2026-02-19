"use client";

import { BarChart3, Brain, Tags, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import FadeContent from "@/components/reactbits/fade-content";
import SplitText from "@/components/reactbits/split-text";
import SpotlightCard from "@/components/reactbits/spotlight-card";

const featureIcons = [Brain, Tags, BarChart3, Users];
const featureKeys = ["ai", "categories", "dashboard", "accounts"] as const;

export function FeaturesSection() {
  const t = useTranslations("Landing.features");

  return (
    <section className="w-full px-6 py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 flex justify-center">
          <SplitText
            className="font-bold text-3xl text-foreground tracking-tight md:text-4xl lg:text-5xl"
            delay={30}
            tag="h2"
            text={t("title")}
          />
        </div>

        <FadeContent blur delay={0.2} duration={0.6}>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {featureKeys.map((key, index) => {
              const Icon = featureIcons[index];
              return (
                <SpotlightCard
                  key={key}
                  spotlightColor="rgba(228, 76, 61, 0.15)"
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground text-xl">
                      {t(`${key}.title`)}
                    </h3>
                    <p className="text-muted-foreground">
                      {t(`${key}.description`)}
                    </p>
                  </div>
                </SpotlightCard>
              );
            })}
          </div>
        </FadeContent>
      </div>
    </section>
  );
}
