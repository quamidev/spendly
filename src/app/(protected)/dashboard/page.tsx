import { DollarSign, Tag, TrendingDown, TrendingUp } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { CategoryBarChart } from "@/components/dashboard/category-bar-chart";
import { DailyTrendChart } from "@/components/dashboard/daily-trend-chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getDashboardData } from "@/lib/dashboard.queries";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [t, locale] = await Promise.all([
    getTranslations("Dashboard"),
    getLocale(),
  ]);

  // Layout already guards auth with redirect, user is always defined here
  const data = await getDashboardData(
    supabase,
    user?.id ?? "",
    t("uncategorized")
  );

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "GTQ",
      minimumFractionDigits: 2,
    }).format(value);

  const formatDate = (date: string) =>
    new Date(`${date}T12:00:00`).toLocaleDateString(locale, {
      day: "numeric",
      month: "short",
    });

  const percentChange =
    data.previousMonthTotal > 0
      ? ((data.currentMonthTotal - data.previousMonthTotal) /
          data.previousMonthTotal) *
        100
      : 0;

  const topCategory =
    data.categoryTotals.length > 0 ? data.categoryTotals[0] : null;

  return (
    <>
      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">
              {t("totalThisMonth")}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">
              {formatCurrency(data.currentMonthTotal)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">
              {t("vsPreviousMonth")}
            </CardTitle>
            {percentChange >= 0 ? (
              <TrendingUp className="h-4 w-4 text-destructive" />
            ) : (
              <TrendingDown className="h-4 w-4 text-green-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">
              {percentChange >= 0 ? "+" : ""}
              {percentChange.toFixed(1)}%
            </div>
            <p className="text-muted-foreground text-xs">
              {t("previousMonthAmount", {
                amount: formatCurrency(data.previousMonthTotal),
              })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">
              {t("topCategory")}
            </CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {topCategory ? (
              <>
                <div className="font-bold text-2xl">{topCategory.category}</div>
                <p className="text-muted-foreground text-xs">
                  {t("thisMonth", {
                    amount: formatCurrency(topCategory.total),
                  })}
                </p>
              </>
            ) : (
              <div className="text-muted-foreground text-sm">{t("noData")}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("expensesByCategory")}</CardTitle>
            <CardDescription>{t("currentMonthBreakdown")}</CardDescription>
          </CardHeader>
          <CardContent>
            <CategoryBarChart data={data.categoryTotals} locale={locale} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("dailyTrend")}</CardTitle>
            <CardDescription>{t("dailyTrendDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <DailyTrendChart data={data.dailyTotals} locale={locale} />
          </CardContent>
        </Card>
      </div>

      {/* Recent Expenses */}
      <Card>
        <CardHeader>
          <CardTitle>{t("recentExpenses")}</CardTitle>
          <CardDescription>{t("recentExpensesDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          {data.recentExpenses.length === 0 ? (
            <p className="text-muted-foreground text-sm">{t("noExpenses")}</p>
          ) : (
            <div className="space-y-4">
              {data.recentExpenses.map((expense) => (
                <div
                  className="flex items-center justify-between"
                  key={expense.id}
                >
                  <div className="space-y-1">
                    <p className="font-medium text-sm leading-none">
                      {expense.description}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {formatDate(expense.date)}
                      {expense.category ? ` · ${expense.category}` : ""}
                      {expense.owner ? ` · ${expense.owner}` : ""}
                    </p>
                  </div>
                  <div className="font-medium text-sm">
                    {formatCurrency(expense.amount)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
