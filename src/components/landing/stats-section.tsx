"use client";

import { useTranslations } from "next-intl";
import CountUp from "@/components/reactbits/count-up";
import FadeContent from "@/components/reactbits/fade-content";

export function StatsSection() {
  const t = useTranslations("Landing.stats");

  const stats = [
    { label: t("usersLabel"), value: Number(t("usersValue")), suffix: "+" },
    {
      label: t("expensesLabel"),
      value: Number(t("expensesValue")),
      suffix: "+",
    },
    {
      label: t("categoriesLabel"),
      value: Number(t("categoriesValue")),
      suffix: "+",
    },
  ];

  return (
    <section className="w-full px-6 py-20 md:py-28">
      <FadeContent blur duration={0.6}>
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-3">
          {stats.map((stat) => (
            <div
              className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-8 text-center"
              key={stat.label}
            >
              <span className="font-bold text-4xl text-primary md:text-5xl">
                <CountUp duration={2.5} separator="," to={stat.value} />
                {stat.suffix}
              </span>
              <span className="text-muted-foreground text-sm">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </FadeContent>
    </section>
  );
}
