import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { statusColor, type Simulacao } from "@/lib/mockData";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  appendUserSimulacao,
  deleteSimulacaoFromHistorico,
  duplicateSimulacao,
  formatDataBr,
  getMergedSimulacoes,
  getPlannedScenario,
  pathForSimulacaoTipo,
  planScenarioBase,
  subscribeSimulacoesChanged,
} from "@/lib/simulationHistory";
import { StatusBadge } from "@/components/StatusBadge";
import { Save, Copy, Trash2, Play, History, Settings2, ChevronRight } from "lucide-react";
function runMockAction(label: string, onDone?: () => void) {
  window.setTimeout(() => {
    toast.success(label, { description: "Integração com API pendente — ação simulada." });
    onDone?.();
  }, 450);
}

interface Props {
  tipo: "Anual" | "Mensal" | "Diária";
  title: string;
  subtitle: string;
  filters: ReactNode;
  children: ReactNode;
  defaultName?: string;
  /** % de aderência exibido no histórico ao salvar (derivado da tela atual). */
  atendimentoPreview?: number;
}

export function SimulationShell({
  tipo,
  title,
  subtitle,
  filters,
  children,
  defaultName,
  atendimentoPreview = 88,
}: Props) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [nome, setNome] = useState(defaultName || `Nova Simulação ${tipo}`);
  const [statusFiltro, setStatusFiltro] = useState<string>("all");
  const [pending, setPending] = useState<null | "save" | "dup" | "plan">(null);
  const [mergedSims, setMergedSims] = useState(() => getMergedSimulacoes());
  const [apagarCenario, setApagarCenario] = useState<Simulacao | null>(null);
  const [confirmPlanOpen, setConfirmPlanOpen] = useState(false);
  const [nextStepOpen, setNextStepOpen] = useState(false);
  const [planResult, setPlanResult] = useState<null | { replaced?: Simulacao | null }>(null);
  const appliedNomeFromUrl = useRef(false);

  useEffect(() => subscribeSimulacoesChanged(() => setMergedSims(getMergedSimulacoes())), []);

  const nomeQuery = searchParams.get("nome");
  useEffect(() => {
    if (!nomeQuery?.trim()) return;
    appliedNomeFromUrl.current = true;
    setNome(decodeURIComponent(nomeQuery.trim()));
    const next = new URLSearchParams(searchParams);
    next.delete("nome");
    setSearchParams(next, { replace: true });
  }, [nomeQuery, searchParams, setSearchParams]);

  useEffect(() => {
    if (appliedNomeFromUrl.current) return;
    if (defaultName != null && defaultName !== "") {
      setNome(defaultName);
    }
  }, [defaultName]);

  const lista = useMemo(() => {
    const base = mergedSims.filter((s) => s.tipo === tipo);
    if (statusFiltro === "all") return base;
    const st = statusFiltro === "vigente" ? "Vigente" : statusFiltro === "planejada" ? "Planejada" : "Rascunho";
    return base.filter((s) => s.status === st);
  }, [tipo, statusFiltro, mergedSims]);

  const nomeTrim = nome.trim();
  const currentFromHistory = useMemo(
    () => mergedSims.find((s) => s.tipo === tipo && s.nome === nomeTrim) ?? null,
    [mergedSims, tipo, nomeTrim],
  );

  const plannedForTipo = useMemo(() => getPlannedScenario(tipo), [tipo, mergedSims]);
  const hasOtherPlanned =
    plannedForTipo && (!currentFromHistory || plannedForTipo.id !== currentFromHistory.id);
  const isAlreadyPlanned =
    (currentFromHistory && currentFromHistory.status === "Planejada") ||
    (plannedForTipo && currentFromHistory && plannedForTipo.id === currentFromHistory.id);

  const etapaFluxo = tipo === "Anual" ? 1 : tipo === "Mensal" ? 2 : 3;
  const status: Simulacao["status"] = isAlreadyPlanned ? "Planejada" : "Rascunho";

  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col min-w-0">
        {/* Cabeçalho */}
        <div className="sticky top-0 z-20 border-b border-border/80 bg-card/95 px-6 py-4 shadow-sm backdrop-blur-sm supports-[backdrop-filter]:bg-card/90">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-start gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                    Simulador PCP · Cenário {tipo}
                  </p>
                  <span className="hidden h-1 w-1 rounded-full bg-border sm:inline-block" aria-hidden />
                  <p className="text-[11px] font-medium text-muted-foreground">
                    etapa {etapaFluxo} de 3 do fluxo encadeado
                  </p>
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-3">
                  <Input
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="h-auto max-w-md border-0 bg-transparent px-0 font-display text-xl font-semibold tracking-tight text-foreground shadow-none focus-visible:ring-0 sm:text-2xl"
                  />
                  <span className={`shrink-0 text-[10px] font-medium px-2.5 py-1 rounded-full ${statusColor(status)}`}>{status}</span>
                </div>
                <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">{subtitle}</p>
                <div className="mt-4 h-1.5 w-16 rounded-full bg-primary" aria-hidden />
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2">{filters}</div>
            </div>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 space-y-12 overflow-auto px-6 py-8 pb-28">
          <h2 className="mb-0 max-w-3xl font-display text-base font-semibold leading-snug text-foreground sm:text-lg">
            {title}
          </h2>
          {children}
        </div>

        {/* Rodapé fixo — largura total (layout sem sidebar) */}
        <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-card/95 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] backdrop-blur supports-[backdrop-filter]:bg-card/85">
          <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3 px-6 py-3">
            <div className="text-xs text-muted-foreground flex min-w-0 items-center gap-2">
              <Settings2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <span className="truncate">
                Valores são projeções da simulação · ajustes recalculam o cenário ao salvar
              </span>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pending !== null}
                onClick={() => {
                  setPending("dup");
                  runMockAction("Cenário duplicado.", () => setPending(null));
                }}
              >
                <Copy className="h-4 w-4 mr-2" />
                Duplicar
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={pending !== null || isAlreadyPlanned}
                title="Define este cenário como base para a próxima etapa do planejamento"
                onClick={() => {
                  setConfirmPlanOpen(true);
                }}
              >
                <Play className="h-4 w-4 mr-2" />
                Planejar
              </Button>
              <Button
                size="sm"
                className="bg-primary hover:bg-primary/90"
                disabled={pending !== null}
                onClick={() => {
                  const label = nome.trim() || `Simulação ${tipo}`;
                  setPending("save");
                  window.setTimeout(() => {
                    appendUserSimulacao({
                      nome: label,
                      tipo,
                      status: "Rascunho",
                      criador: "Você",
                      data: formatDataBr(),
                      atendimento: Math.min(100, Math.max(0, Math.round(atendimentoPreview))),
                    });
                    setPending(null);
                    toast.success("Simulação salva", {
                      description: `“${label}” foi adicionada ao histórico de cenários ${tipo.toLowerCase()}.`,
                    });
                  }, 450);
                }}
              >
                <Save className="h-4 w-4 mr-2" />
                {pending === "save" ? "Salvando…" : "Salvar Simulação"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Painel histórico */}
      <aside className="hidden xl:flex flex-col w-80 border-l bg-muted/20">
        <div className="p-4 border-b bg-card flex items-center gap-2">
          <History className="h-4 w-4 text-muted-foreground" aria-hidden />
          <h3 className="font-semibold text-sm">Histórico deste tipo ({tipo})</h3>
          <Badge variant="secondary" className="ml-auto text-[10px]">{lista.length}</Badge>
        </div>
        <div className="p-3 border-b bg-card">
          <Select value={statusFiltro} onValueChange={setStatusFiltro}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="vigente">Vigente</SelectItem>
              <SelectItem value="planejada">Planejada</SelectItem>
              <SelectItem value="rascunho">Rascunho</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 overflow-auto p-3 space-y-2">
          {lista.map((s) => (
            <Card
              key={s.id}
              className={`p-3 transition-colors hover:border-primary/50 ${
                s.nome === nomeTrim ? "border-primary/45 ring-2 ring-primary/15" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{s.nome}</div>
                  <div className="text-[10px] text-muted-foreground font-mono">{s.id}</div>
                </div>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full whitespace-nowrap ${statusColor(s.status)}`}>{s.status}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                <span>{s.criador}</span>
                <span>{s.data}</span>
              </div>
              <div className="mt-2 flex items-center justify-between gap-2">
                <StatusBadge pct={s.atendimento} />
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    title="Abrir este cenário no editor"
                    type="button"
                    onClick={() => {
                      const path = pathForSimulacaoTipo(s.tipo);
                      navigate(`${path}?nome=${encodeURIComponent(s.nome)}`);
                    }}
                  >
                    <ChevronRight className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    title="Duplicar como rascunho"
                    type="button"
                    onClick={() => {
                      duplicateSimulacao(s);
                      toast.success("Cenário duplicado", {
                        description: `“${s.nome} (cópia)” foi adicionado ao seu histórico.`,
                      });
                    }}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    title="Excluir da lista"
                    type="button"
                    onClick={() => setApagarCenario(s)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </aside>

      <AlertDialog open={apagarCenario !== null} onOpenChange={(open) => !open && setApagarCenario(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir cenário da lista?</AlertDialogTitle>
            <AlertDialogDescription>
              {apagarCenario ? (
                <>
                  <span className="block font-medium text-foreground">“{apagarCenario.nome}”</span>
                  <span className="mt-2 block">
                    Cenários de demonstração somem desta lista; os que você salvou são removidos do armazenamento local
                    do navegador.
                  </span>
                </>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (!apagarCenario) return;
                deleteSimulacaoFromHistorico(apagarCenario.id);
                toast.success("Cenário removido", { description: apagarCenario.nome });
                setApagarCenario(null);
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* MODAL 1 — Confirmação de Planejamento */}
      <AlertDialog open={confirmPlanOpen} onOpenChange={setConfirmPlanOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {tipo === "Diária" ? "Finalizar planejamento operacional?" : "Definir este cenário como base de planejamento?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {tipo === "Diária" ? (
                <span className="block">
                  Este cenário será considerado como referência para análise do plano e riscos de execução.
                </span>
              ) : (
                <>
                  <span className="block">
                    Este cenário será utilizado como base para o próximo nível de simulação.
                    <br />
                    A simulação atual planejada será substituída.
                  </span>
                  <span className="mt-3 block text-sm">
                    • Os dados deste cenário serão congelados como hipótese base
                    <br />• Isso permitirá avançar para o detalhamento (mensal ou diário)
                  </span>
                </>
              )}

              {hasOtherPlanned ? (
                <span className="mt-4 block font-medium text-foreground">
                  ⚠️ Ao planejar este cenário, o cenário planejado atual será substituído.
                </span>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending !== null}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={pending !== null}
              onClick={() => {
                setPending("plan");
                const res = planScenarioBase({
                  tipo,
                  nome: nomeTrim || `Simulação ${tipo}`,
                  atendimento: atendimentoPreview,
                  criador: "Você",
                });
                setPlanResult({ replaced: res.replacedPlanned });
                setPending(null);
                setConfirmPlanOpen(false);

                if (tipo === "Diária") {
                  toast.success("✅ Cenário diário definido como referência");
                  return;
                }

                toast.success("✅ Cenário definido como base de planejamento");
                setNextStepOpen(true);
              }}
            >
              {tipo === "Diária" ? "Confirmar Planejamento" : "Confirmar e Planejar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* MODAL 2 — Próximo passo */}
      <AlertDialog open={nextStepOpen} onOpenChange={setNextStepOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Próximo passo do planejamento</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="block">Agora você pode detalhar este cenário no próximo nível de simulação.</span>
              <span className="mt-3 block font-medium text-foreground">
                {tipo === "Anual"
                  ? "Deseja detalhar a distribuição ao longo dos meses?"
                  : "Deseja analisar o risco no nível diário?"}
              </span>
              {planResult?.replaced ? (
                <span className="mt-3 block text-sm text-muted-foreground">
                  Base anterior substituída: <span className="font-medium text-foreground">{planResult.replaced.nome}</span>
                </span>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continuar aqui</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const nextTipo = tipo === "Anual" ? ("Mensal" as const) : ("Diária" as const);
                const path = pathForSimulacaoTipo(nextTipo);
                navigate(`${path}?nome=${encodeURIComponent(nomeTrim || `Simulação ${nextTipo}`)}`);
                setNextStepOpen(false);
              }}
            >
              {tipo === "Anual" ? "Ir para Simulação Mensal" : "Ir para Simulação Diária"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
