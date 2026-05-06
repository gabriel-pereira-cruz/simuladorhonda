import { useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, BarChart3 } from "lucide-react";
import { meses, semaforo, computeConsolidatedMonthlyTotals, modelos } from "@/constants/mockData";
import { ProgressBar } from "@/components/common/StatusBadge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Props {
  titulo: string;
  subtitulo: string;
  periodo: string;
  labels: string[];
  totals: { plano: number; atendido: number; pct: number }[];
}

function ReportShell({ titulo, subtitulo, periodo, labels, totals }: Props) {
  const max = Math.max(...totals.map((t) => t.plano), 1);
  const [exporting, setExporting] = useState<null | "pdf" | "excel">(null);
  const { pathname } = useLocation();

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
              {subtitulo}. Dados simulados a partir das hipóteses do cenário.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {[
                { to: "/relatorios/anual", label: "Anual" },
                { to: "/relatorios/mensal", label: "Mensal" },
                { to: "/relatorios/diaria", label: "Diária" },
              ].map((t) => {
                const active = pathname === t.to;
                return (
                  <Button
                    key={t.to}
                    asChild
                    size="sm"
                    variant={active ? "default" : "outline"}
                    className={active ? "bg-primary hover:bg-primary/90" : ""}
                  >
                    <NavLink to={t.to}>{t.label}</NavLink>
                  </Button>
                );
              })}
            </div>
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
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center justify-between gap-2">
            <h3 className="font-display text-lg font-semibold text-foreground">Aderência projetada — {periodo}</h3>
            <BarChart3 className="h-5 w-5 shrink-0 text-primary/70" aria-hidden />
          </div>
          <div className="rounded-xl bg-muted/30 p-4">
          <div className="flex h-64 items-end gap-1 sm:gap-3 border-b border-border/50 pb-2 pl-2 overflow-x-auto">
            {totals.map((t, i) => {
              const s = semaforo(t.pct);
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 min-w-[20px] sm:min-w-0">
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
          <div className="mt-3 flex gap-1 sm:gap-3 pl-2 overflow-x-auto">
            {labels.map((m, i) => (
              <div key={i} className="min-w-[20px] sm:min-w-0 flex-1 truncate text-center text-[10px] sm:text-xs font-medium text-muted-foreground">
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

      <Card className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm overflow-hidden">
        <h3 className="font-display text-base font-semibold text-foreground">Detalhamento — {periodo}</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Gap = motos (unidades de produção) não atendidas pela restrição de racks/bens de giro nas hipóteses do cenário.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/35">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap">Período</th>
                <th className="px-3 py-3 text-right text-xs font-semibold text-muted-foreground whitespace-nowrap">Plano de produção (motos)</th>
                <th className="px-3 py-3 text-right text-xs font-semibold text-muted-foreground whitespace-nowrap">Atendido projetado (motos)</th>
                <th className="px-3 py-3 text-right text-xs font-semibold text-foreground whitespace-nowrap">Gap de produção (motos não atendidas)</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-foreground whitespace-nowrap">% de aderência ao plano</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap">Restrição associada (rack / família)</th>
              </tr>
            </thead>
            <tbody>
              {totals.map((t, i) => {
                const restricoes = ["F-PLAST / RK-005", "F-TANQUE / RK-004", "F-MOTOR / RK-002", "F-CHASSI / RK-001"];
                const r = restricoes[i % restricoes.length];
                return (
                  <tr key={i} className="border-b border-border/50 transition-colors duration-150 hover:bg-muted/35">
                    <td className="px-3 py-2 font-medium whitespace-nowrap">{labels[i]}</td>
                    <td className="px-3 py-2 text-right font-mono text-muted-foreground/70 tabular-nums">{t.plano.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right font-mono text-muted-foreground/70 tabular-nums">{t.atendido.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right">
                      <span className={`font-mono text-sm font-bold tabular-nums ${t.plano - t.atendido > (max * 0.15) ? "text-destructive" : "text-warning"}`}>
                        −{(t.plano - t.atendido).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-24 sm:w-32"><ProgressBar pct={t.pct} /></div>
                        <span className={`text-sm font-bold tabular-nums ${semaforo(t.pct).text}`}>{t.pct}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-xs text-muted-foreground whitespace-nowrap">{t.pct < 100 ? r : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export const RelatorioAnual = () => {
  const totals = useMemo(() => {
    const usoPadrao = modelos.map(() => 85);
    return computeConsolidatedMonthlyTotals(usoPadrao, "all");
  }, []);
  
  const labels = meses.map(m => {
    const isNextYear = ["Jan", "Fev", "Mar"].includes(m);
    return `${m}/${isNextYear ? "2027" : "2026"}`;
  });

  return (
    <ReportShell 
      titulo="Projeção Anual de Aderência" 
      subtitulo="Cenário consolidado do plano de produção limitado por racks e bens de giro" 
      periodo="Ano Ki26 (Abr/26 a Mar/27)"
      labels={labels}
      totals={totals}
    />
  );
};

export const RelatorioMensal = () => {
  const { labels, totals } = useMemo(() => {
    const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));
    const t = days.map((_, i) => {
      // Mock data for daily (monthly view)
      const plano = Math.round(1100 + Math.sin(i) * 200);
      const atendido = Math.round(plano * (0.85 + Math.random() * 0.15));
      return { plano, atendido, pct: Math.round((atendido / plano) * 100) };
    });
    return { labels: days.map(d => `${d}/Mai`), totals: t };
  }, []);

  return (
    <ReportShell 
      titulo="Projeção Mensal de Aderência" 
      subtitulo="Detalhamento diário do gap projetado por restrição logística" 
      periodo="Maio/2026"
      labels={labels}
      totals={totals}
    />
  );
};

export const RelatorioDiario = () => {
  const { labels, totals } = useMemo(() => {
    const hours = Array.from({ length: 16 }, (_, i) => `${String(i + 6).padStart(2, '0')}:00`);
    const t = hours.map((_, i) => {
      // Mock data for hourly (daily view)
      const plano = Math.round(68 + Math.sin(i * 0.5) * 15);
      const atendido = Math.round(plano * (0.80 + Math.random() * 0.20));
      return { plano, atendido, pct: Math.round((atendido / plano) * 100) };
    });
    return { labels: hours, totals: t };
  }, []);

  return (
    <ReportShell 
      titulo="Projeção Diária de Aderência" 
      subtitulo="Visão hora a hora da disponibilidade projetada e dos riscos de parada" 
      periodo="05/05/2026"
      labels={labels}
      totals={totals}
    />
  );
};
