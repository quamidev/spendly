"use client";

import { BarChart3, Mic, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import ClickSpark from "@/components/reactbits/click-spark";
import FadeContent from "@/components/reactbits/fade-content";
import SplitText from "@/components/reactbits/split-text";

const stepIcons = [Mic, Sparkles, BarChart3];
const stepKeys = ["step1", "step2", "step3"] as const;

export function HowItWorksSection() {
  const t = useTranslations("Landing.howItWorks");

  return (
    <section className="w-full bg-muted/30 px-6 py-20 md:py-28">
      <div className="mx-auto max-w-4xl">
        <div className="mb-16 flex justify-center">
          <SplitText
            className="font-bold text-3xl text-foreground tracking-tight md:text-4xl lg:text-5xl"
            delay={30}
            tag="h2"
            text={t("title")}
          />
        </div>

        <div className="flex flex-col gap-12">
          {stepKeys.map((key, index) => {
            const Icon = stepIcons[index];
            return (
              <FadeContent blur delay={index * 0.15} duration={0.6} key={key}>
                <div className="flex items-start gap-6">
                  <ClickSpark
                    sparkColor="oklch(0.645 0.246 16.439)"
                    sparkCount={6}
                    sparkRadius={20}
                  >
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground text-xl">
                      {index + 1}
                    </div>
                  </ClickSpark>
                  <div className="flex flex-col gap-2 pt-1">
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold text-foreground text-xl">
                        {t(`${key}.title`)}
                      </h3>
                    </div>
                    <p className="text-muted-foreground">
                      {t(`${key}.description`)}
                    </p>
                  </div>
                </div>
              </FadeContent>
            );
          })}
        </div>
      </div>
    </section>
  );
}
