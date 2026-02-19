"use client";

import { useTranslations } from "next-intl";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { DailyTotal } from "@/lib/dashboard.queries";

interface DailyTrendChartProps {
  data: DailyTotal[];
  locale: string;
}

export function DailyTrendChart({ data, locale }: DailyTrendChartProps) {
  const t = useTranslations("Dashboard");

  const chartConfig = {
    total: { label: t("expenseLabel"), color: "var(--color-chart-2)" },
  } satisfies ChartConfig;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "GTQ",
      minimumFractionDigits: 0,
    }).format(value);

  if (data.every((d) => d.total === 0)) {
    return (
      <div className="flex h-[300px] items-center justify-center text-muted-foreground text-sm">
        {t("noExpenseData")}
      </div>
    );
  }

  return (
    <ChartContainer className="h-[300px] w-full" config={chartConfig}>
      <AreaChart data={data} margin={{ left: 0, right: 16, top: 8, bottom: 8 }}>
        <defs>
          <linearGradient id="fillTotal" x1="0" x2="0" y1="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--color-chart-2)"
              stopOpacity={0.8}
            />
            <stop
              offset="95%"
              stopColor="var(--color-chart-2)"
              stopOpacity={0.1}
            />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} />
        <XAxis
          axisLine={false}
          dataKey="date"
          interval="preserveStartEnd"
          tickFormatter={(v: string) => {
            const day = v.split("-")[2];
            return String(Number(day));
          }}
          tickLine={false}
        />
        <YAxis
          axisLine={false}
          tickFormatter={(v) => formatCurrency(v)}
          tickLine={false}
          width={70}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value) => formatCurrency(Number(value))}
              labelFormatter={(label) => {
                const d = new Date(`${label}T12:00:00`);
                return d.toLocaleDateString(locale, {
                  day: "numeric",
                  month: "short",
                });
              }}
            />
          }
        />
        <Area
          dataKey="total"
          fill="url(#fillTotal)"
          stroke="var(--color-chart-2)"
          strokeWidth={2}
          type="monotone"
        />
      </AreaChart>
    </ChartContainer>
  );
}
