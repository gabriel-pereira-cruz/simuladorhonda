import { simulacoes as mockSimulacoes, type Simulacao, type Status } from "@/lib/mockData";

const STORAGE_KEY = "hodieweb_simulacoes_usuario_v1";
const HIDDEN_MOCK_IDS_KEY = "hodieweb_simulacoes_mock_ocultos_v1";
const STATUS_OVERRIDE_KEY = "hodieweb_simulacoes_status_override_v1";

export const SIMULACOES_CHANGED = "hodieweb-simulacoes-changed";

export function pathForSimulacaoTipo(t: Simulacao["tipo"]): string {
  if (t === "Anual") return "/simulacao/anual";
  if (t === "Mensal") return "/simulacao/mensal";
  return "/simulacao/diaria";
}

export function formatDataBr(d = new Date()): string {
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function getUserSimulacoes(): Simulacao[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as Simulacao[]) : [];
  } catch {
    return [];
  }
}

function getMockOriginalStatus(id: string): Status | null {
  const m = mockSimulacoes.find((x) => x.id === id);
  return m?.status ?? null;
}

function getStatusOverrides(): Record<string, Status> {
  try {
    const raw = localStorage.getItem(STATUS_OVERRIDE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as Record<string, Status>;
  } catch {
    return {};
  }
}

function setStatusOverrides(map: Record<string, Status>) {
  localStorage.setItem(STATUS_OVERRIDE_KEY, JSON.stringify(map));
}

function getHiddenMockIds(): Set<string> {
  try {
    const raw = localStorage.getItem(HIDDEN_MOCK_IDS_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? new Set(parsed as string[]) : new Set();
  } catch {
    return new Set();
  }
}

function setHiddenMockIds(ids: Set<string>) {
  localStorage.setItem(HIDDEN_MOCK_IDS_KEY, JSON.stringify([...ids]));
}

/** IDs do mock removidos da UI pelo usuário (não altera `mockData.ts`). */
export function hideMockSimulacao(id: string): void {
  const set = getHiddenMockIds();
  set.add(id);
  setHiddenMockIds(set);
  window.dispatchEvent(new CustomEvent(SIMULACOES_CHANGED));
}

export function isUserSimulacaoId(id: string): boolean {
  return id.startsWith("SIM-usr-");
}

export function removeUserSimulacaoById(id: string): boolean {
  const user = getUserSimulacoes();
  const next = user.filter((u) => u.id !== id);
  if (next.length === user.length) return false;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next.slice(0, 200)));
  window.dispatchEvent(new CustomEvent(SIMULACOES_CHANGED));
  return true;
}

/** Remove da lista: entradas do usuário no `localStorage` ou oculta mock de demonstração. */
export function deleteSimulacaoFromHistorico(id: string): void {
  if (isUserSimulacaoId(id)) {
    removeUserSimulacaoById(id);
  } else {
    hideMockSimulacao(id);
  }
}

/** Nova linha no histórico do usuário, copiando o cenário (sempre como rascunho). */
export function duplicateSimulacao(s: Simulacao): Simulacao {
  return appendUserSimulacao({
    nome: `${s.nome} (cópia)`,
    tipo: s.tipo,
    status: "Rascunho",
    criador: "Você",
    data: formatDataBr(),
    atendimento: s.atendimento,
  });
}

export function getMergedSimulacoes(): Simulacao[] {
  const user = getUserSimulacoes();
  const hidden = getHiddenMockIds();
  const ids = new Set(user.map((u) => u.id));
  const rest = mockSimulacoes.filter((m) => !ids.has(m.id) && !hidden.has(m.id));
  const overrides = getStatusOverrides();
  return [...user, ...rest].map((s) => (overrides[s.id] ? { ...s, status: overrides[s.id] } : s));
}

export function appendUserSimulacao(entry: Omit<Simulacao, "id"> & { id?: string }): Simulacao {
  const id = entry.id ?? `SIM-usr-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  const row: Simulacao = { ...entry, id };
  const user = getUserSimulacoes();
  user.unshift(row);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user.slice(0, 200)));
  window.dispatchEvent(new CustomEvent(SIMULACOES_CHANGED));
  return row;
}

export function updateUserSimulacao(id: string, patch: Partial<Omit<Simulacao, "id">>): Simulacao | null {
  const user = getUserSimulacoes();
  const idx = user.findIndex((u) => u.id === id);
  if (idx < 0) return null;
  const next = { ...user[idx], ...patch };
  user[idx] = next;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user.slice(0, 200)));
  window.dispatchEvent(new CustomEvent(SIMULACOES_CHANGED));
  return next;
}

export function setSimulacaoStatus(id: string, status: Status): void {
  if (isUserSimulacaoId(id)) {
    updateUserSimulacao(id, { status });
    return;
  }
  const overrides = getStatusOverrides();
  overrides[id] = status;
  setStatusOverrides(overrides);
  window.dispatchEvent(new CustomEvent(SIMULACOES_CHANGED));
}

export function clearSimulacaoStatusOverride(id: string): void {
  if (isUserSimulacaoId(id)) return;
  const overrides = getStatusOverrides();
  if (!overrides[id]) return;
  delete overrides[id];
  setStatusOverrides(overrides);
  window.dispatchEvent(new CustomEvent(SIMULACOES_CHANGED));
}

export function getPlannedScenario(tipo: Simulacao["tipo"]): Simulacao | null {
  return getMergedSimulacoes().find((s) => s.tipo === tipo && s.status === "Planejada") ?? null;
}

type PlanScenarioResult = {
  planned: Simulacao;
  replacedPlanned?: Simulacao | null;
};

/**
 * Define UM cenário como "Planejada" por tipo (Anual/Mensal/Diária).
 * Se já existir outro "Planejada", ele perde o status.
 *
 * - Para cenários do usuário: atualiza no localStorage
 * - Para mocks: aplica override de status (sem alterar mockData.ts)
 */
export function planScenarioBase(params: {
  tipo: Simulacao["tipo"];
  nome: string;
  atendimento: number;
  criador?: string;
}): PlanScenarioResult {
  const nomeTrim = params.nome.trim() || `Simulação ${params.tipo}`;
  const merged = getMergedSimulacoes();

  const existing = merged.find((s) => s.tipo === params.tipo && s.nome === nomeTrim) ?? null;
  const plannedTarget: Simulacao =
    existing ??
    appendUserSimulacao({
      nome: nomeTrim,
      tipo: params.tipo,
      status: "Rascunho",
      criador: params.criador ?? "Você",
      data: formatDataBr(),
      atendimento: Math.min(100, Math.max(0, Math.round(params.atendimento))),
    });

  const currentPlanned = merged.find(
    (s) => s.tipo === params.tipo && s.status === "Planejada" && s.id !== plannedTarget.id,
  );

  if (currentPlanned) {
    if (isUserSimulacaoId(currentPlanned.id)) {
      updateUserSimulacao(currentPlanned.id, { status: "Rascunho" });
    } else {
      const original = getMockOriginalStatus(currentPlanned.id);
      if (original) {
        setSimulacaoStatus(currentPlanned.id, original);
      } else {
        clearSimulacaoStatusOverride(currentPlanned.id);
      }
    }
  }

  // Atualiza data/atendimento na referência “planejada” para refletir o cenário atual.
  if (isUserSimulacaoId(plannedTarget.id)) {
    updateUserSimulacao(plannedTarget.id, {
      status: "Planejada",
      data: formatDataBr(),
      atendimento: Math.min(100, Math.max(0, Math.round(params.atendimento))),
      nome: nomeTrim,
    });
  } else {
    setSimulacaoStatus(plannedTarget.id, "Planejada");
  }

  const planned = getMergedSimulacoes().find((s) => s.id === plannedTarget.id) ?? plannedTarget;
  return { planned, replacedPlanned: currentPlanned ?? null };
}

export function subscribeSimulacoesChanged(cb: () => void): () => void {
  const fn = () => cb();
  window.addEventListener(SIMULACOES_CHANGED, fn);
  return () => window.removeEventListener(SIMULACOES_CHANGED, fn);
}
