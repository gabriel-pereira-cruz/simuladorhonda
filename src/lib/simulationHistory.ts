import { simulacoes as mockSimulacoes, type Simulacao } from "@/lib/mockData";

const STORAGE_KEY = "hodieweb_simulacoes_usuario_v1";
const HIDDEN_MOCK_IDS_KEY = "hodieweb_simulacoes_mock_ocultos_v1";

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
  return [...user, ...rest];
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

export function subscribeSimulacoesChanged(cb: () => void): () => void {
  const fn = () => cb();
  window.addEventListener(SIMULACOES_CHANGED, fn);
  return () => window.removeEventListener(SIMULACOES_CHANGED, fn);
}
