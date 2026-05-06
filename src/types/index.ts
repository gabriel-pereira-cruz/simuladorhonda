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

export interface Rack {
  codigo: string;
  descricao: string;
  familia: string;
  quantidade: number;
  disponivel: number;
  leadTime: number;
}
