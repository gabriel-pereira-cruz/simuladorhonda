import { racks } from "@/constants/mockData";
import { type DashboardPayload } from "@/types";
import { getMergedSimulacoes } from "@/services/simulation.service";


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

  const simulacoesRecentes = getMergedSimulacoes().slice(0, 8);
  const vigente = simulacoesRecentes.find((s) => s.status === "Vigente");
  const tipoVigente = vigente?.tipo || "Anual";

  let prodTitle = "Produção projetada (ano)";
  let prodValue = "340.8k";
  if (tipoVigente === "Mensal") {
    prodTitle = "Produção projetada (mês)";
    prodValue = "28.4k";
  } else if (tipoVigente === "Diária") {
    prodTitle = "Produção projetada (dia)";
    prodValue = "1.2k";
  }

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
        { label: prodTitle, value: prodValue, hint: "motos (unidades de produção) · cenário vigente" },
        { label: "Famílias monitoradas", value: 5, hint: "no escopo da simulação" },
      ],
    },
    fluxo: [
      { pct: 94, status: "Vigente" },
      { pct: 96, status: "Vigente" },
      { pct: 98, status: "Vigente" },
    ],
    racksDestaque,
    simulacoesRecentes,
  };
}
