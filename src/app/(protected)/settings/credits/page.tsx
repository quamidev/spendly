import { format, type Locale } from "date-fns";
import { enUS, es } from "date-fns/locale";
import { AlertTriangle, History, Sparkles, Zap } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { AppHeader } from "@/components/layout/app-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCreditsAndUsage } from "@/lib/actions/credits";

const DATE_FNS_LOCALES: Record<string, Locale> = { es, en: enUS };

const MODEL_LABELS: Record<string, string> = {
  "gpt-4o-mini": "GPT-4o Mini",
  "gpt-4o": "GPT-4o",
  "whisper-1": "Whisper",
};

export default async function CreditsPage() {
  const [result, t, locale] = await Promise.all([
    getCreditsAndUsage(),
    getTranslations("Settings.credits"),
    getLocale(),
  ]);

  const dateFnsLocale = DATE_FNS_LOCALES[locale] ?? es;

  if (!result.success) {
    return (
      <>
        <AppHeader title={t("pageTitle")} />
        <div className="flex-1 p-6">
          <Alert variant="destructive">
            <AlertTriangle className="size-4" />
            <AlertTitle>{t("error")}</AlertTitle>
            <AlertDescription>{result.error}</AlertDescription>
          </Alert>
        </div>
      </>
    );
  }

  const { balance, stats } = result.data;
  const isLowBalance = balance.credits < 0.1;

  return (
    <>
      <AppHeader title={t("pageTitle")} />
      <div className="flex-1 space-y-6 p-6">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Low balance warning */}
          {isLowBalance && (
            <Alert variant="destructive">
              <AlertTriangle className="size-4" />
              <AlertTitle>{t("lowBalance")}</AlertTitle>
              <AlertDescription>
                {t("lowBalanceDescription")}
              </AlertDescription>
            </Alert>
          )}

          {/* Balance card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="size-5" />
                {t("currentBalance")}
              </CardTitle>
              <CardDescription>
                {t("balanceDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="font-bold text-5xl">
                  {balance.formattedCredits}
                </span>
                <span className="text-muted-foreground text-xl">USD</span>
              </div>
              {stats.totalCost > 0 && (
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {t("usedLast30Days")}
                    </span>
                    <span className="font-medium">
                      ${stats.totalCost.toFixed(4)}
                    </span>
                  </div>
                  <Progress
                    className="h-2"
                    value={Math.min(
                      (stats.totalCost / (stats.totalCost + balance.credits)) *
                        100,
                      100
                    )}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Usage by type */}
          {Object.keys(stats.requestsByType).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Zap className="size-4" />
                  {t("usageByType")}
                </CardTitle>
                <CardDescription>
                  {t("usageByTypeDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-3">
                  {Object.entries(stats.requestsByType).map(
                    ([type, typeData]) => (
                      <div
                        className="rounded-lg border p-4 text-center"
                        key={type}
                      >
                        <p className="font-medium text-sm">
                          {t(`requestTypes.${type}` as Parameters<typeof t>[0]) || type}
                        </p>
                        <p className="mt-2 font-bold text-2xl">
                          {typeData.count}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {t("requests")}
                        </p>
                        <Badge className="mt-2 font-mono" variant="secondary">
                          ${typeData.cost.toFixed(4)}
                        </Badge>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent usage history */}
          {stats.recentUsage.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <History className="size-4" />
                  {t("recentHistory")}
                </CardTitle>
                <CardDescription>
                  {t("recentHistoryDescription", {
                    count: stats.recentUsage.length,
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("tableDate")}</TableHead>
                      <TableHead>{t("tableType")}</TableHead>
                      <TableHead>{t("tableModel")}</TableHead>
                      <TableHead className="text-right">
                        {t("tableCost")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.recentUsage.map((usage) => (
                      <TableRow key={`${usage.date}-${usage.requestType}`}>
                        <TableCell className="font-mono text-sm">
                          {format(new Date(usage.date), "dd MMM HH:mm", {
                            locale: dateFnsLocale,
                          })}
                        </TableCell>
                        <TableCell>
                          {t(`requestTypes.${usage.requestType}` as Parameters<typeof t>[0]) ||
                            usage.requestType}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {MODEL_LABELS[usage.model] || usage.model}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          ${usage.cost.toFixed(6)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Pricing info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {t("pricingInfo")}
              </CardTitle>
              <CardDescription>
                {t("pricingDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 text-sm sm:grid-cols-3">
                <div className="rounded-lg border p-3">
                  <p className="font-medium">
                    {t("requestTypes.parse_expense")}
                  </p>
                  <p className="text-muted-foreground text-xs">GPT-4o Mini</p>
                  <p className="mt-1 font-mono text-lg">~$0.0001</p>
                  <p className="text-muted-foreground text-xs">
                    {t("perRequest")}
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="font-medium">
                    {t("requestTypes.categorize_expense")}
                  </p>
                  <p className="text-muted-foreground text-xs">GPT-4o Mini</p>
                  <p className="mt-1 font-mono text-lg">~$0.00005</p>
                  <p className="text-muted-foreground text-xs">
                    {t("perRequest")}
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="font-medium">
                    {t("requestTypes.voice_transcription")}
                  </p>
                  <p className="text-muted-foreground text-xs">Whisper</p>
                  <p className="mt-1 font-mono text-lg">$0.006</p>
                  <p className="text-muted-foreground text-xs">
                    {t("perMinute")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
