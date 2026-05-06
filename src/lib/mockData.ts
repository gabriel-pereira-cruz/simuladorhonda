// Mock data for PCP Honda simulator
export type Status = "Rascunho" | "Planejada" | "Vigente";

export interface Simulacao {
  id: string;
  nome: string;
  tipo: "Anual" | "Mensal" | "Diária";
  status: Status;
  criador: string;
  data: string;
  atendimento: number; // %
}

export const modelos = [
  "CG 160 Titan", "CG 160 Fan", "CG 160 Start", "Biz 125", "Biz 110i",
  "Pop 110i", "XRE 300", "NXR 160 Bros", "CB 300F Twister", "PCX 160",
];

export const familiasRack = ["F-CHASSI", "F-MOTOR", "F-RODA", "F-TANQUE", "F-PLAST"];

export const racks = [
  { codigo: "RK-001", descricao: "Rack Chassi CG", familia: "F-CHASSI", quantidade: 480, disponivel: 412, leadTime: 12 },
  { codigo: "RK-002", descricao: "Rack Motor 160cc", familia: "F-MOTOR", quantidade: 360, disponivel: 298, leadTime: 14 },
  { codigo: "RK-003", descricao: "Rack Roda Dianteira", familia: "F-RODA", quantidade: 520, disponivel: 510, leadTime: 9 },
  { codigo: "RK-004", descricao: "Rack Tanque Combustível", familia: "F-TANQUE", quantidade: 240, disponivel: 168, leadTime: 18 },
  { codigo: "RK-005", descricao: "Rack Carenagem Plástica", familia: "F-PLAST", quantidade: 300, disponivel: 145, leadTime: 21 },
  { codigo: "RK-006", descricao: "Rack Motor Biz 125", familia: "F-MOTOR", quantidade: 280, disponivel: 261, leadTime: 14 },
  { codigo: "RK-007", descricao: "Rack Chassi Bros", familia: "F-CHASSI", quantidade: 200, disponivel: 184, leadTime: 12 },
  { codigo: "RK-008", descricao: "Rack Roda Traseira", familia: "F-RODA", quantidade: 520, disponivel: 488, leadTime: 9 },
];

export const meses = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

/**
 * Plano anual mock — curvas mais variadas por modelo e mês (picos em meses diferentes,
 * sazonalidade e “dezembro”) para gráficos e semáforos mais diversos, sem mudar o tipo de dado.
 */
export const planoAnual = modelos.map((modelo, i) => ({
  modelo,
  meses: meses.map((_, m) => {
    const base = 520 + i * 38 + (i % 3) * 22;
    const wave = Math.round(220 * Math.sin(m * 0.55 + i * 0.35));
    const q = Math.floor(m / 3);
    const quarterLift = [40, 10, 55, 95][q] ?? 0;
    const summer = m >= 5 && m <= 8 ? 85 + (i % 4) * 12 : 0;
    const dez = m === 11 ? 180 + i * 15 : 0;
    const dip = m === 1 || m === 2 ? -45 - (i % 2) * 20 : 0;
    return Math.max(180, Math.round(base + wave + quarterLift + summer + dez + dip));
  }),
}));

/** Família de rack atribuída a cada modelo (mock) — usada só para filtro agregado na UI. */
export const modeloToFamilia: Record<string, string> = Object.fromEntries(
  modelos.map((m, i) => [m, familiasRack[i % familiasRack.length]]),
);

/** Consolida plano × atendimento por mês; mesma lógica da simulação anual (sem alterar regra de cálculo). */
export function computeConsolidatedMonthlyTotals(
  usoRack: number[],
  familia: "all" | string = "all",
): { plano: number; atendido: number; pct: number }[] {
  const indices = planoAnual
    .map((_, i) => i)
    .filter((i) => familia === "all" || modeloToFamilia[planoAnual[i].modelo] === familia);

  if (indices.length === 0) {
    return meses.map(() => ({ plano: 0, atendido: 0, pct: 0 }));
  }

  return meses.map((_, mIdx) => {
    let plano = 0;
    let atendido = 0;
    for (const i of indices) {
      const p = planoAnual[i];
      plano += p.meses[mIdx];
      atendido += Math.round(p.meses[mIdx] * (usoRack[i] / 100));
    }
    const pct = plano ? Math.round((atendido / plano) * 100) : 0;
    return { plano, atendido, pct };
  });
}

export const simulacoes: Simulacao[] = [
  { id: "SIM-2026-014", nome: "Plano Anual Ki26 v3", tipo: "Anual", status: "Vigente", criador: "R. Tanaka", data: "02/05/2026", atendimento: 94 },
  { id: "SIM-2026-013", nome: "Cenário Pico Dezembro", tipo: "Anual", status: "Planejada", criador: "M. Silva", data: "28/04/2026", atendimento: 87 },
  { id: "SIM-2026-012", nome: "Anual Ki26 v2", tipo: "Anual", status: "Rascunho", criador: "R. Tanaka", data: "20/04/2026", atendimento: 91 },
  { id: "SIM-2026-011", nome: "Mai/26 Operacional", tipo: "Mensal", status: "Vigente", criador: "J. Pereira", data: "30/04/2026", atendimento: 96 },
  { id: "SIM-2026-010", nome: "Mai/26 Cenário B", tipo: "Mensal", status: "Rascunho", criador: "J. Pereira", data: "29/04/2026", atendimento: 82 },
  { id: "SIM-2026-009", nome: "05/05 Turno A+B", tipo: "Diária", status: "Vigente", criador: "C. Almeida", data: "05/05/2026", atendimento: 98 },
];

export const statusColor = (s: Status) => ({
  Rascunho: "bg-muted text-muted-foreground",
  Planejada: "bg-warning/15 text-warning-foreground border border-warning/30",
  Vigente: "bg-success/15 text-success border border-success/30",
}[s]);

export const semaforo = (pct: number) => {
  if (pct < 70) return { color: "bg-destructive", text: "text-destructive", label: "Crítico" };
  if (pct < 90) return { color: "bg-warning", text: "text-warning", label: "Atenção" };
  return { color: "bg-success", text: "text-success", label: "Saudável" };
};
