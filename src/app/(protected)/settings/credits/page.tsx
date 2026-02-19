import { format } from "date-fns";
import { es } from "date-fns/locale";
import { AlertTriangle, History, Sparkles, Zap } from "lucide-react";
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

const REQUEST_TYPE_LABELS: Record<string, string> = {
  parse_expense: "Parseo de texto",
  categorize_expense: "Categorización",
  voice_transcription: "Transcripción de voz",
};

const MODEL_LABELS: Record<string, string> = {
  "gpt-4o-mini": "GPT-4o Mini",
  "gpt-4o": "GPT-4o",
  "whisper-1": "Whisper",
};

export default async function CreditsPage() {
  const result = await getCreditsAndUsage();

  if (!result.success) {
    return (
      <>
        <AppHeader title="Créditos de IA" />
        <div className="flex-1 p-6">
          <Alert variant="destructive">
            <AlertTriangle className="size-4" />
            <AlertTitle>Error</AlertTitle>
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
      <AppHeader title="Créditos de IA" />
      <div className="flex-1 space-y-6 p-6">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Low balance warning */}
          {isLowBalance && (
            <Alert variant="destructive">
              <AlertTriangle className="size-4" />
              <AlertTitle>Créditos bajos</AlertTitle>
              <AlertDescription>
                Tu saldo de créditos es bajo. Las funciones de IA (parseo de
                texto, voz y categorización automática) no funcionarán sin
                créditos.
              </AlertDescription>
            </Alert>
          )}

          {/* Balance card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="size-5" />
                Balance actual
              </CardTitle>
              <CardDescription>
                Los créditos se usan para funciones de IA como parseo de texto,
                transcripción de voz y categorización automática.
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
                      Usado en últimos 30 días
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
                  Uso por tipo de solicitud
                </CardTitle>
                <CardDescription>
                  Desglose de uso en los últimos 30 días
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
                          {REQUEST_TYPE_LABELS[type] || type}
                        </p>
                        <p className="mt-2 font-bold text-2xl">
                          {typeData.count}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          solicitudes
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
                  Historial reciente
                </CardTitle>
                <CardDescription>
                  Últimas {stats.recentUsage.length} solicitudes de IA
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Modelo</TableHead>
                      <TableHead className="text-right">Costo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.recentUsage.map((usage) => (
                      <TableRow key={`${usage.date}-${usage.requestType}`}>
                        <TableCell className="font-mono text-sm">
                          {format(new Date(usage.date), "dd MMM HH:mm", {
                            locale: es,
                          })}
                        </TableCell>
                        <TableCell>
                          {REQUEST_TYPE_LABELS[usage.requestType] ||
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
                Información de precios
              </CardTitle>
              <CardDescription>
                Costos aproximados por tipo de operación
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 text-sm sm:grid-cols-3">
                <div className="rounded-lg border p-3">
                  <p className="font-medium">Parseo de texto</p>
                  <p className="text-muted-foreground text-xs">GPT-4o Mini</p>
                  <p className="mt-1 font-mono text-lg">~$0.0001</p>
                  <p className="text-muted-foreground text-xs">por solicitud</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="font-medium">Categorización</p>
                  <p className="text-muted-foreground text-xs">GPT-4o Mini</p>
                  <p className="mt-1 font-mono text-lg">~$0.00005</p>
                  <p className="text-muted-foreground text-xs">por solicitud</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="font-medium">Transcripción de voz</p>
                  <p className="text-muted-foreground text-xs">Whisper</p>
                  <p className="mt-1 font-mono text-lg">$0.006</p>
                  <p className="text-muted-foreground text-xs">por minuto</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
