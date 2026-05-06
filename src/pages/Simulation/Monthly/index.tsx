import { useState, useMemo } from "react";
import { SimulationShell } from "@/components/simulation/SimulationShell";
import { ScenarioSummary, SectionHeader } from "@/components/simulation/ScenarioSummary";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { meses, semaforo, racks } from "@/constants/mockData";
import { stable01 } from "@/utils/stableHash";
import { StatusBadge, ProgressBar } from "@/components/common/StatusBadge";

const dias = Array.from({ length: 31 }, (_, i) => i + 1);

export default function SimulacaoMensal() {
  const [mes, setMes] = useState("4");
  const [versao, setVersao] = useState("v3");
  const [ajustes, setAjustes] = useState<Record<number, number>>({});

  const data = useMemo(() => {
    return dias.map((d) => {
      const base = Math.round(900 + Math.sin(d * 0.4) * 180 + (d % 7 === 0 ? -700 : 0));
      const planejado = ajustes[d] ?? base;
      const fator = 0.75 + stable01("sim-mensal", mes, String(d), versao) * 0.25;
      const disponivel = Math.round(planejado * fator);
      const pct = Math.round((disponivel / planejado) * 100);
      const gap = planejado - disponivel;
      return { dia: d, planejado, disponivel, pct, gap, weekend: d % 7 === 0 || d % 7 === 6 };
    });
  }, [ajustes, mes, versao]);

  const total = data.reduce((a, b) => a + b.planejado, 0);
  const media = Math.round(data.reduce((a, b) => a + b.pct, 0) / data.length);
  const diasRisco = data.filter((d) => d.pct < 70).length;

  return (
    <SimulationShell
      tipo="Mensal"
      title={`Cenário mensal · ${meses[+mes]}/2026 · Em quais dias existe risco de falta?`}
      subtitle="Detalhamento diário do mês · ajustes recalculam a aderência (dados simulados)"
      defaultName={`${meses[+mes]}/26 Operacional v2`}
      atendimentoPreview={media}
      filters={
        <>
          <Select value={mes} onValueChange={setMes}>
            <SelectTrigger className="h-9 w-[140px] text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {meses.map((m, i) => (
                <SelectItem key={m} value={String(i)}>{m}/2026</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={versao} onValueChange={setVersao}>
            <SelectTrigger className="h-9 w-[140px] text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="v3">Versão v3 (atual)</SelectItem>
              <SelectItem value="v2">Versão v2</SelectItem>
              <SelectItem value="v1">Versão v1</SelectItem>
            </SelectContent>
          </Select>
        </>
      }
    >
      <ScenarioSummary
        aderencia={media}
        aderenciaLabel={`Aderência projetada · ${meses[+mes]}/2026`}
        limitadaPor="Família F-TANQUE · Rack RK-004"
        hipotese="Lead time 12-21 dias por família · Giro 85% · Mix Plano Ki26 v3"
        restricao={{ familia: "F-TANQUE", rack: "RK-004", impacto: 48, causa: "Giro insuficiente em finais de semana de pico" }}
        secundarios={[
          { label: "Produção simulada", value: `${(total / 1000).toFixed(1)}k`, hint: "motos (unidades de produção) projetadas" },
          { label: "Dias úteis", value: data.filter((d) => !d.weekend).length, hint: "no cenário" },
          { label: "Dias com risco", value: diasRisco, hint: "abaixo de 70%", tone: diasRisco > 0 ? "danger" : "default" },
        ]}
      />

      {/* ZONA 2 — Distribuição do risco no tempo */}
      <SectionHeader
        zone="Zona 2 · Distribuição do risco"
        title={`Calendário de aderência projetada – ${meses[+mes]}/2026`}
        hint="Cada célula projeta a aderência diária do cenário."
      />
      <Card className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
        <div className="grid grid-cols-7 gap-2">
          {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((d) => (
            <div key={d} className="text-center text-xs font-medium text-muted-foreground">
              {d}
            </div>
          ))}
          {data.map((d) => {
            const s = semaforo(d.pct);
            return (
              <div
                key={d.dia}
                className={`rounded-xl border border-border/70 p-2.5 transition-all duration-150 ${
                  d.weekend ? "bg-muted/35 opacity-70" : "bg-card"
                } ${d.pct < 70 ? "ring-2 ring-destructive/35" : "hover:border-primary/30 hover:shadow-sm"}`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-semibold tabular-nums">{d.dia}</span>
                  <span className={`h-2 w-2 shrink-0 rounded-full ${s.color}`} title={s.label} />
                </div>
                <div className="mt-1 font-mono text-[10px] tabular-nums text-muted-foreground">
                  {d.disponivel}/{d.planejado}
                </div>
                <div className={`mt-0.5 text-sm font-bold tabular-nums ${s.text}`}>{d.pct}%</div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* ZONA 3 — Detalhamento analítico */}
      <SectionHeader
        zone="Zona 3 · Detalhamento analítico"
        title="Ajustes da hipótese diária"
        hint="Edite as quantidades planejadas para recalcular o cenário. Foco visual: % de aderência e GAP."
      />
      <Card className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm">
        <div className="max-h-[420px] overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 border-b bg-muted/35">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-semibold text-muted-foreground">Dia</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-muted-foreground">Plano de produção simulado</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-muted-foreground">Disponibilidade</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-foreground">% Aderência</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-foreground">GAP</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-muted-foreground">Restrição</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d, i) => (
                <tr
                  key={d.dia}
                  className={`border-b border-border/50 transition-colors duration-150 hover:bg-muted/35 ${d.weekend ? "opacity-55" : ""}`}
                >
                  <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{String(d.dia).padStart(2, "0")}/{String(+mes + 1).padStart(2, "0")}</td>
                  <td className="px-3 py-2">
                    <Input
                      type="number"
                      value={d.planejado}
                      onChange={(e) => setAjustes({ ...ajustes, [d.dia]: +e.target.value })}
                      className="h-7 w-24 text-xs"
                    />
                  </td>
                  <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{d.disponivel}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-24"><ProgressBar pct={d.pct} /></div>
                      <span className={`text-sm font-bold tabular-nums ${semaforo(d.pct).text}`}>{d.pct}%</span>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`font-mono text-sm font-semibold ${d.gap > 200 ? "text-destructive" : d.gap > 0 ? "text-warning" : "text-muted-foreground"}`}>
                      {d.gap > 0 ? `−${d.gap.toLocaleString()}` : "0"}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs text-muted-foreground/70">
                    {d.pct < 70 ? <span className="font-mono">{racks[i % racks.length].codigo}</span> : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </SimulationShell>
  );
}
