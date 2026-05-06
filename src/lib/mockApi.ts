import { racks, type Simulacao } from "@/lib/mockData";
import { getMergedSimulacoes } from "@/lib/simulationHistory";

/** Dados do painel inicial — mesmo conteúdo que o Dashboard exibia estaticamente; prontos para trocar por `fetch` real. */
export type DashboardPayload = {
  anoKiLabel: string;
  summary: {
    aderencia: number;
    aderenciaLabel: string;
    limitadaPor: string;
    hipotese: string;
    restricao: {
      familia: string;
      rack: string;
      impacto: number;
      causa: string;
    };
    secundarios: {
      label: string;
      value: string | number;
      hint?: string;
      tone?: "default" | "danger";
    }[];
  };
  fluxo: { pct: number; status: string }[];
  racksDestaque: {
    codigo: string;
    descricao: string;
    familia: string;
    disponivel: number;
    quantidade: number;
    pct: number;
  }[];
  simulacoesRecentes: Simulacao[];
};

function delay(ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const t = window.setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => {
      window.clearTimeout(t);
      reject(new DOMException("Aborted", "AbortError"));
    });
  });
}

/**
 * Simula chamada de API ao painel. Use `?mockError=1` na URL para testar estado de erro (apenas dev).
 */
export async function fetchDashboardData(signal?: AbortSignal): Promise<DashboardPayload> {
  await delay(500, signal);

  const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  if (params?.get("mockError") === "1") {
    throw new Error("Não foi possível carregar o painel. Tente novamente.");
  }

  const racksDestaque = [...racks]
    .map((r) => ({ ...r, pct: Math.round((r.disponivel / r.quantidade) * 100) }))
    .sort((a, b) => a.pct - b.pct)
    .slice(0, 5);

  return {
    anoKiLabel: "2026",
    summary: {
      aderencia: 94,
      aderenciaLabel: "Aderência projetada · Cenário vigente",
      limitadaPor: "Família F-PLAST · Rack RK-005",
      hipotese: "Lead time médio 14 dias · Giro 85% · Mix Plano Ki26 v3",
      restricao: {
        familia: "F-PLAST",
        rack: "RK-005",
        impacto: 62,
        causa: "Lead time elevado (21 dias) + giro insuficiente",
      },
      secundarios: [
        { label: "Cenários ativos", value: 6, hint: "2 vigentes · 1 planejada · 3 rascunho" },
        { label: "Produção projetada (mês)", value: "28.4k", hint: "unidades · cenário vigente" },
        { label: "Famílias monitoradas", value: 5, hint: "no escopo da simulação" },
      ],
    },
    fluxo: [
      { pct: 94, status: "Vigente" },
      { pct: 96, status: "Vigente" },
      { pct: 98, status: "Vigente" },
    ],
    racksDestaque,
    simulacoesRecentes: getMergedSimulacoes().slice(0, 8),
  };
}
