import { useMemo, useState } from "react";
import { SimulationShell } from "@/components/SimulationShell";
import { ScenarioSummary, SectionHeader } from "@/components/ScenarioSummary";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import {
  meses,
  modelos,
  planoAnual,
  semaforo,
  familiasRack,
  modeloToFamilia,
  computeConsolidatedMonthlyTotals,
} from "@/lib/mockData";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

/** Torres mensais: cores sólidas variadas mantendo leitura (frio = ok, âmbar = atenção, vermelho = crítico). */
function mesTowerBg(pct: number, m: number) {
  if (pct < 70) return m % 2 === 0 ? "bg-red-600" : "bg-rose-600";
  if (pct < 90) return m % 2 === 0 ? "bg-amber-500" : "bg-orange-500";
  const ok = ["bg-emerald-600", "bg-teal-600", "bg-cyan-600", "bg-sky-600", "bg-green-700", "bg-blue-600"] as const;
  return ok[m % ok.length];
}

const TRIM = [
  { label: "Jan–mar", span: 3, band: "bg-sky-100 text-sky-900", sub: "bg-sky-50/90" },
  { label: "Abr–jun", span: 3, band: "bg-violet-100 text-violet-900", sub: "bg-violet-50/90" },
  { label: "Jul–set", span: 3, band: "bg-emerald-100 text-emerald-900", sub: "bg-emerald-50/90" },
  { label: "Out–dez", span: 3, band: "bg-orange-100 text-orange-900", sub: "bg-orange-50/90" },
] as const;

function mesSubBg(m: number) {
  const q = Math.floor(m / 3);
  return TRIM[q]?.sub ?? "bg-muted/40";
}

export default function SimulacaoAnual() {
  const [ano, setAno] = useState("2026");
  const [familia, setFamilia] = useState<string>("all");
  const [usoRack, setUsoRack] = useState<number[]>(modelos.map(() => 85));

  const totals = useMemo(
    () => computeConsolidatedMonthlyTotals(usoRack, familia),
    [usoRack, familia],
  );

  const mediaAtendimento = Math.round(totals.reduce((a, b) => a + b.pct, 0) / totals.length);
  const criticos = totals.filter((t) => t.pct < 70).length;

  return (
    <SimulationShell
      tipo="Anual"
      title="Cenário anual · A quantidade de racks atende ao plano de 12 meses?"
      subtitle={`Ano Ki ${ano} · visão consolidada de 12 meses (dados simulados)`}
      defaultName={`Plano Anual Ki${ano.slice(2)} v4`}
      atendimentoPreview={mediaAtendimento}
      filters={
        <>
          <Select value={ano} onValueChange={setAno}>
            <SelectTrigger className="h-9 w-[120px] text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="2025">Ano Ki 2025</SelectItem>
              <SelectItem value="2026">Ano Ki 2026</SelectItem>
              <SelectItem value="2027">Ano Ki 2027</SelectItem>
            </SelectContent>
          </Select>
          <Select value={familia} onValueChange={setFamilia}>
            <SelectTrigger className="h-9 min-w-[160px] text-xs"><SelectValue placeholder="Família" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as famílias</SelectItem>
              {familiasRack.map((f) => (
                <SelectItem key={f} value={f}>
                  {f}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </>
      }
    >
      <ScenarioSummary
        aderencia={mediaAtendimento}
        aderenciaLabel="Aderência projetada · Plano Anual"
        limitadaPor="Família F-PLAST · Rack RK-005"
        hipotese="Lead time médio 14 dias · Giro 85% · Mix Plano Ki26 v3"
        restricao={{ familia: "F-PLAST", rack: "RK-005", impacto: 62, causa: "Lead time elevado (21 dias) + giro insuficiente" }}
        secundarios={[
          { label: "Plano anual simulado", value: `${(totals.reduce((a, b) => a + b.plano, 0) / 1000).toFixed(1)}k`, hint: "unidades planejadas" },
          { label: "Atendimento projetado", value: `${(totals.reduce((a, b) => a + b.atendido, 0) / 1000).toFixed(1)}k`, hint: "cenário vigente" },
          { label: "Meses com risco", value: criticos, hint: "abaixo de 70% de aderência", tone: criticos > 0 ? "danger" : "default" },
        ]}
      />

      <SectionHeader
        zone="Zona 2 · Distribuição do risco"
        title="Aderência mensal projetada"
        hint="Causa logística dominante: família F-PLAST · rack RK-005 (lead time 21d)."
      />
      <Card className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
        <div className="grid grid-cols-12 gap-1.5 sm:gap-2">
          {meses.map((m, i) => {
            const pct = totals[i].pct;
            return (
              <div key={m} className="group text-center">
                <div
                  className={cn(
                    "flex h-[5.5rem] items-end justify-center rounded-lg pb-2 text-base font-bold tabular-nums text-white shadow-sm transition-all duration-200 group-hover:brightness-110 group-hover:shadow-md sm:h-24",
                    mesTowerBg(pct, i),
                  )}
                  title={`${semaforo(pct).label} · ${pct}%`}
                >
                  {pct}%
                </div>
                <div className="mt-2 text-xs font-medium text-muted-foreground">{m}</div>
              </div>
            );
          })}
        </div>
        <div className="mt-5 flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/60 px-2.5 py-1">
            <span className="h-2 w-2 shrink-0 rounded-full bg-success" />
            Saudável (&gt;90%)
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/60 px-2.5 py-1">
            <span className="h-2 w-2 shrink-0 rounded-full bg-warning" />
            Atenção (70–90%)
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/60 px-2.5 py-1">
            <span className="h-2 w-2 shrink-0 rounded-full bg-destructive" />
            Crítico (&lt;70%)
          </span>
        </div>
      </Card>

      <SectionHeader
        zone="Zona 3 · Detalhamento analítico"
        title="Mix por modelo — uso de rack e atendimento por mês"
        hint="O slider define a utilização de rack do modelo. Na grade, cada mês mostra a aderência em relação ao pico de plano do ano (varia com o mix mensal). Passe o mouse na célula para ver atendido × plano."
      />
      <Card className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/70">
                <th
                  rowSpan={2}
                  className="sticky left-0 z-20 min-w-[180px] border-r border-border/60 bg-muted/50 px-3 py-3 text-left text-xs font-semibold text-foreground"
                >
                  Modelo
                </th>
                <th
                  rowSpan={2}
                  className="sticky left-[180px] z-20 min-w-[148px] border-r border-border/60 bg-muted/50 px-2 py-3 text-left text-xs font-semibold text-foreground"
                >
                  Uso de rack
                </th>
                {TRIM.map((t) => (
                  <th
                    key={t.label}
                    colSpan={t.span}
                    className={cn("px-1 py-2 text-center text-[11px] font-semibold", t.band)}
                  >
                    {t.label}
                  </th>
                ))}
                <th
                  rowSpan={2}
                  className="min-w-[72px] border-l border-border/60 bg-muted/50 px-2 py-3 text-right text-xs font-semibold text-foreground"
                >
                  Total plano
                </th>
              </tr>
              <tr className="border-b border-border/80 bg-muted/30">
                {meses.map((m, idx) => (
                  <th
                    key={m}
                    className={cn("min-w-[64px] px-1.5 py-2 text-right text-[11px] font-semibold text-muted-foreground", mesSubBg(idx))}
                  >
                    {m}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {planoAnual
                .map((p, i) => ({ p, i }))
                .filter(({ p }) => familia === "all" || modeloToFamilia[p.modelo] === familia)
                .map(({ p, i }, rowIdx) => {
                const total = p.meses.reduce((a, b) => a + b, 0);
                const peakPlano = Math.max(...p.meses, 1);
                return (
                  <tr
                    key={p.modelo}
                    className={cn(
                      "border-b border-border/50 transition-colors duration-150 hover:bg-muted/30",
                      rowIdx % 2 === 1 && "bg-muted/15",
                    )}
                  >
                    <td
                      className={cn(
                        "sticky left-0 z-10 min-w-[180px] border-r border-border/50 px-3 py-2.5 font-medium shadow-[2px_0_4px_-2px_rgba(0,0,0,0.06)]",
                        rowIdx % 2 === 1 ? "bg-muted/25" : "bg-card",
                      )}
                    >
                      {p.modelo}
                    </td>
                    <td
                      className={cn(
                        "sticky left-[180px] z-10 min-w-[148px] border-r border-border/50 px-2 py-2.5 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.06)]",
                        rowIdx % 2 === 1 ? "bg-muted/25" : "bg-card",
                      )}
                    >
                      <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-2">
                        <Slider
                          value={[usoRack[i]]}
                          onValueChange={(v) => {
                            const next = [...usoRack];
                            next[i] = v[0];
                            setUsoRack(next);
                          }}
                          max={100}
                          step={1}
                          className="w-full min-w-[5rem] sm:w-24"
                        />
                        <span className={cn("font-mono text-xs font-bold tabular-nums sm:w-10 sm:text-right", semaforo(usoRack[i]).text)}>
                          {usoRack[i]}%
                        </span>
                      </div>
                    </td>
                    {p.meses.map((v, m) => {
                      const uso = usoRack[i] ?? 85;
                      const att = v > 0 ? Math.round(v * (uso / 100)) : 0;
                      /** % do atendido em relação ao pico de plano do modelo — varia mês a mês; o slider escala o atendido. */
                      const pctVsPeak =
                        peakPlano > 0 ? Math.min(100, Math.round((100 * att) / peakPlano)) : 0;
                      const pctVsPlano = v > 0 ? Math.round((100 * att) / v) : 0;
                      const tip = `Plano ${v.toLocaleString("pt-BR")} un. · Atendido ${att.toLocaleString("pt-BR")} · ${pctVsPlano}% do plano do mês · ${pctVsPeak}% do pico anual`;
                      return (
                        <td
                          key={m}
                          title={tip}
                          className={cn("px-1.5 py-2 text-right align-middle", mesSubBg(m))}
                        >
                          <span
                            className={cn(
                              "inline-block min-w-[2.25rem] font-display text-sm font-bold tabular-nums",
                              semaforo(pctVsPeak).text,
                            )}
                          >
                            {v <= 0 ? "—" : `${pctVsPeak}%`}
                          </span>
                        </td>
                      );
                    })}
                    <td className="border-l border-border/50 bg-muted/20 px-2 py-2.5 text-right font-mono text-sm font-semibold tabular-nums text-foreground">
                      {(total / 1000).toFixed(1)}k
                    </td>
                  </tr>
                );
              })}
              <tr className="sticky bottom-0 border-t-2 border-border bg-industrial text-industrial-foreground shadow-[0_-2px_8px_rgba(0,0,0,0.08)]">
                <td className="sticky left-0 z-10 min-w-[180px] border-r border-white/10 bg-industrial px-3 py-2.5 font-semibold shadow-[2px_0_4px_-2px_rgba(0,0,0,0.2)]">
                  Consolidado
                </td>
                <td className="sticky left-[180px] z-10 min-w-[148px] border-r border-white/10 bg-industrial px-2 py-2.5 text-xs font-medium shadow-[2px_0_4px_-2px_rgba(0,0,0,0.2)]">
                  % aderência
                </td>
                {totals.map((t, i) => (
                  <td key={i} className="px-2 py-2.5 text-right">
                    <div className="font-mono text-[10px] tabular-nums opacity-80">{(t.atendido / 1000).toFixed(1)}k</div>
                    <div
                      className={`text-sm font-bold tabular-nums ${
                        t.pct < 70 ? "text-red-200" : t.pct < 90 ? "text-amber-200" : "text-emerald-200"
                      }`}
                    >
                      {t.pct}%
                    </div>
                  </td>
                ))}
                <td className="px-3 py-2.5 text-right text-base font-bold tabular-nums">{mediaAtendimento}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </SimulationShell>
  );
}
