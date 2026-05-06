import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { statusColor, type Simulacao } from "@/constants/mockData";
import { pathForSimulacaoTipo, subscribeSimulacoesChanged } from "@/services/simulation.service";
import { toast } from "sonner";
import { StatusBadge, ProgressBar } from "@/components/common/StatusBadge";
import { ScenarioSummary, SectionHeader } from "@/components/simulation/ScenarioSummary";
import { fetchDashboardData, type DashboardPayload } from "@/services/dashboard.service";
import { useDashboard } from "@/hooks/useDashboard";
import {
  CalendarRange,
  CalendarDays,
  Clock,
  ArrowRight,
  Plus,
  AlertCircle,
} from "lucide-react";

const fluxoMeta = [
  { to: "/simulacao/anual", icon: CalendarRange, title: "Anual", desc: "O plano anual é viável com os racks disponíveis?", etapa: "Etapa 1" },
  { to: "/simulacao/mensal", icon: CalendarDays, title: "Mensal", desc: "Em quais meses ocorre risco de falta?", etapa: "Etapa 2" },
  { to: "/simulacao/diaria", icon: Clock, title: "Diária", desc: "Em que dia/hora a produção pode parar?", etapa: "Etapa 3" },
] as const;

function DashboardSkeleton() {
  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto pb-12">
      <div className="space-y-2">
        <Skeleton className="h-3 w-48" />
        <Skeleton className="h-8 w-full max-w-xl" />
        <Skeleton className="h-4 w-full max-w-2xl" />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <Skeleton className="h-48 rounded-xl lg:col-span-5" />
        <Skeleton className="h-48 rounded-xl lg:col-span-4" />
        <div className="grid gap-3 lg:col-span-3">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
      </div>
      <Skeleton className="h-40 w-full rounded-xl" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Skeleton className="h-64 rounded-xl lg:col-span-2" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { state, reload: load } = useDashboard();
  const [novoOpen, setNovoOpen] = useState(false);
  const [novoNome, setNovoNome] = useState("");
  const [novoTipo, setNovoTipo] = useState<Simulacao["tipo"]>("Anual");

  if (state.status === "loading") {
    return <DashboardSkeleton />;
  }

  if (state.status === "error") {
    return (
      <div className="p-6 max-w-[1600px] mx-auto pb-12">
        <Alert variant="destructive" className="max-w-lg">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro ao carregar o painel</AlertTitle>
          <AlertDescription className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
            <span className="text-sm">{state.message}</span>
            <Button size="sm" variant="secondary" className="w-fit shrink-0" onClick={() => void load()}>
              Tentar novamente
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const { data } = state;
  const { summary } = data;

  return (
    <div className="mx-auto max-w-[1600px] space-y-10 p-6 pb-12">
      <div className="mb-2">
        <div className="rounded-2xl bg-card shadow-sm">
          <div className="px-6 py-5 sm:px-7 sm:py-6">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                    PCP Honda · Painel de cenários
                  </p>
                  <span className="hidden h-1 w-1 rounded-full bg-border sm:inline-block" aria-hidden />
                  <p className="text-[11px] font-medium text-muted-foreground">Ano Ki {data.anoKiLabel}</p>
                </div>

                <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  Disponibilidade de racks e bens de giro
                </h1>

                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                  Acompanhe a aderência estimada ao plano de produção. Dados simulados — não representam a operação em tempo
                  real.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                <Button variant="outline" size="sm" asChild>
                  <Link to="/simulacao/anual">
                    <CalendarRange className="h-4 w-4 mr-2" />
                    Abrir simulação anual
                  </Link>
                </Button>
                <Button
                  size="sm"
                  className="bg-primary hover:bg-primary/90"
                  type="button"
                  onClick={() => {
                    setNovoNome("");
                    setNovoTipo("Anual");
                    setNovoOpen(true);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Novo cenário
                </Button>
              </div>
            </div>

          </div>
        </div>
      </div>

      <ScenarioSummary
        aderencia={summary.aderencia}
        aderenciaLabel={summary.aderenciaLabel}
        limitadaPor={summary.limitadaPor}
        hipotese={summary.hipotese}
        restricao={summary.restricao}
        secundarios={summary.secundarios}
      />

      <SectionHeader
        zone="Zona 2 · Fluxo de simulação"
        title="Anual → Mensal → Diária"
        hint="Navegue do plano anual até a janela de horas críticas."
      />
      <div className="rounded-2xl border border-border/70 bg-muted/35 p-2 sm:p-3">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
          {fluxoMeta.map((s, idx) => {
            const f = data.fluxo[idx];
            return (
              <Link key={s.to} to={s.to} className="group block h-full">
                <div className="flex h-full flex-col rounded-xl border border-border/80 bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/12 text-primary transition-colors group-hover:bg-primary/20">
                        <s.icon className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-medium text-muted-foreground">{s.etapa}</span>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-primary" />
                  </div>
                  <div className="font-display text-base font-semibold text-foreground">Cenário {s.title}</div>
                  <div className="mt-1 flex-1 text-sm leading-snug text-muted-foreground">{s.desc}</div>
                  <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-3">
                    <Badge variant="secondary" className="h-6 text-[10px] font-medium">
                      {f.status}
                    </Badge>
                    <StatusBadge pct={f.pct} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SectionHeader
            zone="Zona 3 · Detalhamento analítico"
            title="Racks que mais restringem o plano de produção (projeção)"
            right={
              <Link to="/cadastros/racks" className="text-xs text-primary hover:underline">
                Ver parâmetros
              </Link>
            }
          />
          <Card className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
            <div>
              <div className="grid grid-cols-12 items-center gap-3 rounded-lg bg-muted/30 px-3 py-2 text-[11px] font-semibold text-muted-foreground">
                <div className="col-span-3">Rack (código / descrição)</div>
                <div className="col-span-2">Família</div>
                <div className="col-span-2">Disponível / Total (racks)</div>
                <div className="col-span-3">Utilização projetada</div>
                <div className="col-span-2 text-right">% de restrição</div>
              </div>
              {data.racksDestaque.map((r) => (
                <div
                  key={r.codigo}
                  className="grid grid-cols-12 items-center gap-3 border-b border-border/50 px-3 py-3.5 transition-colors duration-150 last:border-b-0 hover:bg-muted/35"
                >
                  <div className="col-span-3">
                    <div className="text-[10px] text-muted-foreground/70 font-mono">{r.codigo}</div>
                    <div className="text-sm font-medium">{r.descricao}</div>
                  </div>
                  <div className="col-span-2 text-xs text-muted-foreground">{r.familia}</div>
                  <div className="col-span-2 text-[11px] text-muted-foreground/70 font-mono">
                    {r.disponivel}/{r.quantidade}
                  </div>
                  <div className="col-span-3">
                    <ProgressBar pct={r.pct} />
                  </div>
                  <div className="col-span-2 text-right">
                    <span
                      className={`text-sm font-bold tabular-nums ${
                        r.pct < 70 ? "text-destructive" : r.pct < 90 ? "text-warning" : "text-success"
                      }`}
                    >
                      {r.pct}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div>
          <SectionHeader
            zone=" "
            title="Cenários recentes"
            right={<Badge variant="secondary" className="text-[10px]">{data.simulacoesRecentes.length}</Badge>}
          />
          <Card className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
            {data.simulacoesRecentes.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">Nenhum cenário para exibir.</p>
            ) : (
              <div className="space-y-2">
                {data.simulacoesRecentes.map((s) => (
                  <div
                    key={s.id}
                    className="rounded-lg border border-transparent px-3 py-3 transition-all duration-150 hover:border-border hover:bg-muted/40 hover:shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{s.nome}</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                          {s.id} · Cenário {s.tipo} · {s.criador}
                        </div>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded ${statusColor(s.status)}`}>{s.status}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[11px] text-muted-foreground">{s.data}</span>
                      <StatusBadge pct={s.atendimento} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      <Dialog open={novoOpen} onOpenChange={setNovoOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Novo cenário</DialogTitle>
            <DialogDescription>
              Defina o nome e o tipo de fluxo. Você será levado à simulação com esse nome; use &quot;Salvar simulação&quot; no rodapé para gravar no histórico.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="novo-cenario-nome">Nome do cenário</Label>
              <Input
                id="novo-cenario-nome"
                value={novoNome}
                onChange={(e) => setNovoNome(e.target.value)}
                placeholder="Ex.: Ki26 revisão Q2"
                autoFocus
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="novo-cenario-tipo">Tipo</Label>
              <Select value={novoTipo} onValueChange={(v) => setNovoTipo(v as Simulacao["tipo"])}>
                <SelectTrigger id="novo-cenario-tipo">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Anual">Cenário anual</SelectItem>
                  <SelectItem value="Mensal">Cenário mensal</SelectItem>
                  <SelectItem value="Diária">Cenário diário</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setNovoOpen(false)}>
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={() => {
                const n = novoNome.trim();
                if (!n) {
                  toast.error("Informe o nome do cenário.");
                  return;
                }
                const path = pathForSimulacaoTipo(novoTipo);
                navigate(`${path}?nome=${encodeURIComponent(n)}`);
                setNovoOpen(false);
                setNovoNome("");
                setNovoTipo("Anual");
              }}
            >
              Continuar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
