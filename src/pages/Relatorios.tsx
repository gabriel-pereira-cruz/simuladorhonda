import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, BarChart3 } from "lucide-react";
import { meses, semaforo, computeConsolidatedMonthlyTotals, modelos } from "@/lib/mockData";
import { ProgressBar } from "@/components/StatusBadge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Props {
  titulo: string;
  subtitulo: string;
  periodo: string;
}

function ReportShell({ titulo, subtitulo, periodo }: Props) {
  const totals = useMemo(() => {
    const usoPadrao = modelos.map(() => 85);
    return computeConsolidatedMonthlyTotals(usoPadrao, "all");
  }, []);

  const max = Math.max(...totals.map((t) => t.plano), 1);

  const [exporting, setExporting] = useState<null | "pdf" | "excel">(null);

  const handleExport = (format: "pdf" | "excel") => {
    setExporting(format);
    window.setTimeout(() => {
      setExporting(null);
      toast.success(
        format === "pdf" ? "PDF gerado (simulação)." : "Planilha gerada (simulação).",
        { description: "Em produção, o arquivo viria da API de exportação." },
      );
    }, 600);
  };

  return (
    <div className="mx-auto max-w-[1600px] space-y-8 p-6">
      <div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">Simulador PCP · Relatórios</p>
              <span className="hidden h-1 w-1 rounded-full bg-border sm:inline-block" aria-hidden />
              <p className="text-[11px] font-medium text-muted-foreground">{periodo}</p>
            </div>
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{titulo}</h1>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              {subtitulo} · valores projetados a partir das hipóteses de simulação
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
          <Button
            variant="outline"
            size="sm"
            disabled={exporting !== null}
            onClick={() => handleExport("pdf")}
          >
            <Download className="h-4 w-4 mr-2" />
            {exporting === "pdf" ? "Gerando…" : "PDF"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={exporting !== null}
            onClick={() => handleExport("excel")}
          >
            <Download className="h-4 w-4 mr-2" />
            {exporting === "excel" ? "Gerando…" : "Excel"}
          </Button>
          </div>
        </div>
        <div className="mt-4 h-1.5 w-16 rounded-full bg-primary" aria-hidden />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center justify-between gap-2">
            <h3 className="font-display text-lg font-semibold text-foreground">Aderência projetada — {periodo}</h3>
            <BarChart3 className="h-5 w-5 shrink-0 text-primary/70" aria-hidden />
          </div>
          <div className="rounded-xl bg-muted/30 p-4">
          <div className="flex h-64 items-end gap-3 border-b border-border/50 pb-2 pl-2">
            {totals.map((t, i) => {
              const s = semaforo(t.pct);
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 min-w-0">
                  <div
                    className={cn(
                      "text-[10px] font-mono tabular-nums font-semibold leading-none",
                      s.text,
                    )}
                    title={`${s.label} · ${t.pct}%`}
                  >
                    {t.pct}%
                  </div>
                  <div className="w-full relative h-full min-h-[120px]">
                    <div
                      className="absolute bottom-0 w-full bg-muted rounded-t"
                      style={{ height: `${(t.plano / max) * 100}%` }}
                    />
                    <div
                      className={`absolute bottom-0 w-full ${s.color} rounded-t`}
                      style={{ height: `${(t.atendido / max) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex gap-3 pl-2">
            {meses.map((m) => (
              <div key={m} className="min-w-0 flex-1 truncate text-center text-xs font-medium text-muted-foreground">
                {m}
              </div>
            ))}
          </div>
          </div>
        </Card>

        <Card className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
          <h3 className="font-display text-base font-semibold text-foreground">Restrição por família</h3>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            % projetada por família — menor % indica maior gargalo logístico.
          </p>
          <div className="mt-4 space-y-3">
            {["F-CHASSI", "F-MOTOR", "F-RODA", "F-TANQUE", "F-PLAST"].map((f, i) => {
              const pct = [94, 88, 96, 72, 58][i];
              return (
                <div key={f} className="rounded-lg bg-muted/40 px-3 py-2.5 transition-colors hover:bg-muted/55">
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground">{f}</span>
                    <span className={cn("font-semibold tabular-nums", semaforo(pct).text)}>{pct}%</span>
                  </div>
                  <ProgressBar pct={pct} />
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <Card className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
        <h3 className="font-display text-base font-semibold text-foreground">Detalhamento — {periodo}</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Gap = unidades não atendidas pela restrição de racks/bens de giro nas hipóteses do cenário.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/35">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-semibold text-muted-foreground">Período</th>
                <th className="px-3 py-3 text-right text-xs font-semibold text-muted-foreground">Plano simulado</th>
                <th className="px-3 py-3 text-right text-xs font-semibold text-muted-foreground">Atendido projetado</th>
                <th className="px-3 py-3 text-right text-xs font-semibold text-foreground">GAP (restrição)</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-foreground">% Aderência</th>
              </tr>
            </thead>
            <tbody>
              {totals.map((t, i) => (
                <tr key={i} className="border-b border-border/50 transition-colors duration-150 hover:bg-muted/35">
                  <td className="px-3 py-2 font-medium">{meses[i]}/2026</td>
                  <td className="px-3 py-2 text-right font-mono text-muted-foreground/70 tabular-nums">{t.plano.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right font-mono text-muted-foreground/70 tabular-nums">{t.atendido.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right">
                    <span className={`font-mono text-sm font-bold tabular-nums ${t.plano - t.atendido > 1500 ? "text-destructive" : "text-warning"}`}>
                      −{(t.plano - t.atendido).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-3">
                      <div className="w-32"><ProgressBar pct={t.pct} /></div>
                      <span className={`text-sm font-bold tabular-nums ${semaforo(t.pct).text}`}>{t.pct}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export const RelatorioAnual = () => <ReportShell titulo="Projeção Anual de Aderência" subtitulo="Cenário consolidado do plano anual limitado por racks e bens de giro" periodo="Anual 2026" />;
export const RelatorioMensal = () => <ReportShell titulo="Projeção Mensal de Aderência" subtitulo="Detalhamento mensal do gap projetado por restrição logística" periodo="Maio/2026" />;
export const RelatorioDiario = () => <ReportShell titulo="Projeção Diária de Aderência" subtitulo="Visão diária da disponibilidade projetada e dos riscos de parada" periodo="05/05/2026" />;
