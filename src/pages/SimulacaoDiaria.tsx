import { useMemo, useState } from "react";
import { SimulationShell } from "@/components/SimulationShell";
import { ScenarioSummary, SectionHeader } from "@/components/ScenarioSummary";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { meses, semaforo, modelos } from "@/lib/mockData";
import { stable01 } from "@/lib/stableHash";
import { ProgressBar } from "@/components/StatusBadge";

const horas = Array.from({ length: 16 }, (_, i) => 6 + i);

export default function SimulacaoDiaria() {
  const [mes, setMes] = useState("4");
  const [dia, setDia] = useState("5");
  const [turno, setTurno] = useState("ab");

  const dadosHora = useMemo(() => {
    return horas.map((h) => {
      const planejado = h < 14 ? 80 : h < 18 ? 95 : 60;
      const fator = 0.7 + stable01("sim-diaria", mes, dia, turno, String(h)) * 0.35;
      const real = Math.round(planejado * fator);
      const pct = Math.round((real / planejado) * 100);
      return { h, planejado, real, pct, gap: planejado - real };
    });
  }, [dia, mes, turno]);

  const total = dadosHora.reduce((a, b) => a + b.planejado, 0);
  const realizado = dadosHora.reduce((a, b) => a + b.real, 0);
  const media = Math.round((realizado / total) * 100);
  const horasRisco = dadosHora.filter((d) => d.pct < 70).length;

  return (
    <SimulationShell
      tipo="Diária"
      title={`Cenário diário · ${dia.padStart(2, "0")}/${(+mes + 1).toString().padStart(2, "0")}/2026 · Em qual hora a restrição pode parar a produção?`}
      subtitle="Projeção hora a hora — não representa execução em tempo real do chão de fábrica"
      defaultName={`${dia.padStart(2, "0")}/${(+mes + 1).toString().padStart(2, "0")} Turno A+B v1`}
      atendimentoPreview={media}
      filters={
        <>
          <Select value={mes} onValueChange={setMes}>
            <SelectTrigger className="h-9 w-[110px] text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {meses.map((m, i) => <SelectItem key={m} value={String(i)}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={dia} onValueChange={setDia}>
            <SelectTrigger className="h-9 w-[80px] text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                <SelectItem key={d} value={String(d)}>{String(d).padStart(2, "0")}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={turno} onValueChange={setTurno}>
            <SelectTrigger className="h-9 w-[140px] text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="a">Turno A</SelectItem>
              <SelectItem value="b">Turno B</SelectItem>
              <SelectItem value="ab">Turnos A + B</SelectItem>
            </SelectContent>
          </Select>
        </>
      }
    >
      <ScenarioSummary
        aderencia={media}
        aderenciaLabel={`Aderência projetada · ${dia.padStart(2, "0")}/${(+mes + 1).toString().padStart(2, "0")}/2026`}
        limitadaPor="Família F-MOTOR · Rack RK-002"
        hipotese="Reposição intra-dia conforme giro · Giro 85% · Mix Turno A+B (CG/Biz dominantes)"
        restricao={{ familia: "F-MOTOR", rack: "RK-002", impacto: 71, causa: "Pico de consumo entre 14h–18h sem giro suficiente" }}
        secundarios={[
          { label: "Plano simulado", value: total, hint: "unidades projetadas" },
          { label: "Atendimento projetado", value: realizado, hint: "cenário vigente" },
          { label: "Horas com risco", value: horasRisco, hint: "restrição RK-002 / F-MOTOR", tone: horasRisco > 0 ? "danger" : "default" },
        ]}
      />

      {/* ZONA 2 — Distribuição do risco */}
      <SectionHeader
        zone="Zona 2 · Distribuição do risco"
        title="Disponibilidade projetada hora a hora"
        hint="Picos de consumo entre 14h–18h concentram o risco de parada."
      />
      <Card className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
        <div className="rounded-xl bg-muted/25 p-3">
          <div className="flex h-44 items-end gap-1.5 border-b border-border/60 pb-2 pl-1 sm:gap-2 sm:pl-2">
            {dadosHora.map((d) => {
              const s = semaforo(d.pct);
              return (
                <div key={d.h} className="group flex min-w-0 flex-1 flex-col items-center gap-1">
                  <div className="text-center">
                    <div className="font-mono text-[9px] tabular-nums text-muted-foreground opacity-0 transition-opacity duration-150 group-hover:opacity-100 sm:text-[10px]">
                      {d.real}/{d.planejado}
                    </div>
                    <div className={`text-[10px] font-bold tabular-nums ${s.text}`}>{d.pct}%</div>
                  </div>
                  <div className="relative h-24 w-full sm:h-28">
                    <div
                      className="absolute bottom-0 w-full rounded-t-md bg-muted"
                      style={{ height: `${(d.planejado / 100) * 100}%` }}
                    />
                    <div
                      className={`absolute bottom-0 w-full rounded-t-md shadow-sm transition-all duration-300 ease-out group-hover:ring-2 group-hover:ring-background ${s.color}`}
                      style={{ height: `${(d.real / 100) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-2 flex gap-1 pl-1 sm:gap-2 sm:pl-2">
            {dadosHora.map((d) => (
              <div key={d.h} className="min-w-0 flex-1 text-center font-mono text-[10px] font-medium text-muted-foreground">
                {d.h}h
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* ZONA 3 — Detalhamento analítico */}
      <SectionHeader
        zone="Zona 3 · Detalhamento analítico"
        title="Ajustes da hipótese hora a hora"
        hint="Foco visual em % de aderência e GAP por janela de tempo."
      />
      <Card className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/35">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-semibold text-muted-foreground">Hora</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-muted-foreground">Modelo dominante</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-muted-foreground">Plano simulado</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-muted-foreground">Disponibilidade</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-foreground">% Aderência</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-foreground">GAP</th>
              </tr>
            </thead>
            <tbody>
              {dadosHora.map((d, i) => (
                <tr key={d.h} className="border-b border-border/50 transition-colors duration-150 hover:bg-muted/35">
                  <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{String(d.h).padStart(2, "0")}:00 – {String(d.h + 1).padStart(2, "0")}:00</td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">{modelos[i % modelos.length]}</td>
                  <td className="px-3 py-2"><Input type="number" defaultValue={d.planejado} className="h-7 w-20 text-xs" /></td>
                  <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{d.real}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-24"><ProgressBar pct={d.pct} /></div>
                      <span className={`text-sm font-bold tabular-nums ${semaforo(d.pct).text}`}>{d.pct}%</span>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`font-mono text-sm font-semibold ${d.gap > 25 ? "text-destructive" : d.gap > 0 ? "text-warning" : "text-muted-foreground"}`}>
                      {d.gap > 0 ? `−${d.gap}` : "0"}
                    </span>
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
