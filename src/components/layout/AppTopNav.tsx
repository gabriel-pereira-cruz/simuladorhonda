import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  ChevronDown,
  FileBarChart2,
  FlaskConical,
  FolderCog,
  History,
  LineChart,
  Settings,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { cadastrosNav, relatoriosNav, simulacoesNav, type NavLeaf } from "@/utils/navigation";
import { statusColor } from "@/constants/mockData";
import { getMergedSimulacoes, pathForSimulacaoTipo, subscribeSimulacoesChanged } from "@/services/simulation.service";
import { StatusBadge } from "@/components/common/StatusBadge";
import logoHodie from "@/assets/logo-hodieweb.png";

function groupActive(items: NavLeaf[], pathname: string) {
  return items.some((i) => pathname === i.url);
}

function NavDropdown({
  label,
  Icon,
  items,
  pathname,
}: {
  label: string;
  Icon: typeof FlaskConical;
  items: NavLeaf[];
  pathname: string;
}) {
  const active = groupActive(items, pathname);

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "relative inline-flex h-full min-h-[2.75rem] items-center gap-2 rounded-t-md border-b-2 px-4 py-2 text-sm font-medium outline-none transition-colors duration-150",
            "text-zinc-300 hover:bg-zinc-800/70 hover:text-white",
            "focus-visible:ring-2 focus-visible:ring-orange-500/90 focus-visible:ring-offset-2 focus-visible:ring-offset-[#212121]",
            "data-[state=open]:bg-zinc-800 data-[state=open]:text-white data-[state=open]:border-orange-500",
            "data-[state=open]:[&_.nav-chevron]:rotate-180",
            active
              ? "border-orange-500 bg-zinc-800/90 text-white"
              : "border-transparent",
          )}
        >
          <Icon className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
          <span className="whitespace-nowrap">{label}</span>
          <ChevronDown
            className="nav-chevron h-3.5 w-3.5 shrink-0 opacity-70 transition-transform duration-200"
            aria-hidden
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={0}
        className={cn(
          "min-w-[13.5rem] overflow-hidden rounded-b-lg rounded-t-none border-x border-b border-zinc-600/90 border-t-0 bg-zinc-900 p-1 text-zinc-100 shadow-xl",
        )}
      >
        {items.map((item) => {
          const isActive = pathname === item.url;
          return (
            <DropdownMenuItem
              key={item.url}
              asChild
              className="p-0 focus:bg-zinc-800 focus:text-white data-[highlighted]:bg-zinc-800 data-[highlighted]:text-white"
            >
              <NavLink
                to={item.url}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 text-sm outline-none transition-colors",
                  "text-zinc-200 hover:bg-zinc-800 hover:text-white",
                  isActive &&
                    "bg-zinc-800/90 font-medium text-orange-400",
                )}
              >
                <item.icon
                  className={cn(
                    "h-4 w-4 shrink-0",
                    isActive ? "text-orange-400" : "text-zinc-400",
                  )}
                  aria-hidden
                />
                {item.title}
              </NavLink>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AppTopNav() {
  const { pathname } = useLocation();
  const [historyOpen, setHistoryOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [historicoSims, setHistoricoSims] = useState(() => getMergedSimulacoes());

  useEffect(() => subscribeSimulacoesChanged(() => setHistoricoSims(getMergedSimulacoes())), []);

  return (
    <>
      <header className="sticky top-0 z-50 flex h-14 w-full shrink-0 items-stretch border-b border-zinc-800 bg-[#212121] px-3 text-zinc-100 sm:px-4">
        <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-5">
          <NavLink
            to="/"
            className="flex shrink-0 items-center py-1.5 outline-none ring-offset-2 ring-offset-[#212121] focus-visible:ring-2 focus-visible:ring-orange-500"
          >
            <img
              src={logoHodie}
              alt="HodieWeb"
              className="h-6 w-auto max-w-[96px] object-contain sm:h-7 sm:max-w-[110px]"
            />
          </NavLink>

          <nav
            className="flex min-w-0 flex-1 items-stretch justify-start overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            aria-label="Principal"
          >
            <div className="flex h-full items-stretch">
              <NavDropdown label="Simulações" Icon={FlaskConical} items={simulacoesNav} pathname={pathname} />
              <NavDropdown label="Cadastros" Icon={FolderCog} items={cadastrosNav} pathname={pathname} />
              <NavDropdown label="Relatórios" Icon={FileBarChart2} items={relatoriosNav} pathname={pathname} />
            </div>
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-0.5 border-l border-zinc-700/80 pl-2 sm:gap-1 sm:pl-3">
            <Link
              to="/#resumo"
              className="rounded-md p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
              aria-label="Ir ao resumo executivo do painel"
              title="Resumo executivo"
            >
              <LineChart className="h-5 w-5" />
            </Link>
            <button
              type="button"
              className="rounded-md p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
              aria-label="Histórico de cenários"
              title="Histórico de cenários"
              onClick={() => setHistoryOpen(true)}
            >
              <History className="h-5 w-5" />
            </button>
            <button
              type="button"
              className="rounded-md p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
              aria-label="Configurações"
              title="Configurações"
              onClick={() => setSettingsOpen(true)}
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <Sheet open={historyOpen} onOpenChange={setHistoryOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Histórico de cenários</SheetTitle>
            <SheetDescription>
              Lista mockada — em produção virá da API. Abra o fluxo correspondente ao tipo de simulação.
            </SheetDescription>
          </SheetHeader>
          <ScrollArea className="mt-4 h-[calc(100vh-8rem)] pr-3">
            <div className="space-y-2">
              {historicoSims.map((s) => (
                <div
                  key={s.id}
                  className="rounded-lg border border-border bg-card p-3 text-card-foreground shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{s.nome}</p>
                      <p className="text-[10px] font-mono text-muted-foreground">{s.id} · Ano Ki26 (Abr/26 a Mar/27)</p>
                    </div>
                    <span className={`shrink-0 text-[9px] px-1.5 py-0.5 rounded-full ${statusColor(s.status)}`}>
                      {s.status}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground">
                    <span>{s.criador}</span>
                    <span>{s.data}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <StatusBadge pct={s.atendimento} />
                    <Badge variant="outline" className="text-[10px] font-normal">
                      {s.tipo}
                    </Badge>
                  </div>
                  <Link
                    to={pathForSimulacaoTipo(s.tipo)}
                    onClick={() => setHistoryOpen(false)}
                    className="mt-3 inline-flex text-xs font-medium text-primary hover:underline"
                  >
                    Abrir fluxo {s.tipo.toLowerCase()}
                  </Link>
                </div>
              ))}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Configurações</SheetTitle>
            <SheetDescription>
              Preferências de sessão e integrações. Sem alteração de regras de negócio do simulador.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4 text-sm text-muted-foreground">
            <p>
              Aqui entrarão opções como <strong className="text-foreground">ano Ki padrão</strong>,{" "}
              <strong className="text-foreground">unidade</strong> e <strong className="text-foreground">tema</strong> quando
              houver backend ou persistência de perfil.
            </p>
            <p className="text-xs">
              Estado atual: apenas interface de protótipo; nenhuma configuração é gravada fora do navegador.
            </p>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
