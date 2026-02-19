"use client";

import { useTranslations } from "next-intl";
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { CategoryTotal } from "@/lib/dashboard.queries";

const COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

const chartConfig = {
  total: { label: "Total" },
} satisfies ChartConfig;

interface CategoryBarChartProps {
  data: CategoryTotal[];
  locale: string;
}

export function CategoryBarChart({ data, locale }: CategoryBarChartProps) {
  const t = useTranslations("Dashboard");

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "GTQ",
      minimumFractionDigits: 0,
    }).format(value);

  if (data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-muted-foreground text-sm">
        {t("noCategoryData")}
      </div>
    );
  }

  return (
    <ChartContainer className="h-[300px] w-full" config={chartConfig}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ left: 0, right: 16, top: 8, bottom: 8 }}
      >
        <CartesianGrid horizontal={false} />
        <YAxis
          axisLine={false}
          dataKey="category"
          fontSize={12}
          tickLine={false}
          type="category"
          width={100}
        />
        <XAxis
          axisLine={false}
          tickFormatter={(v) => formatCurrency(v)}
          tickLine={false}
          type="number"
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value) => formatCurrency(Number(value))}
              hideLabel
            />
          }
        />
        <Bar dataKey="total" radius={[0, 4, 4, 0]}>
          {data.map((_entry, index) => (
            <Cell
              fill={COLORS[index % COLORS.length]}
              key={`cell-${index.toString()}`}
            />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
