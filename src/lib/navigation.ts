import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Bike,
  Boxes,
  CalendarDays,
  CalendarRange,
  Clock,
  LayoutDashboard,
  Layers,
  Package,
  Timer,
} from "lucide-react";

export type NavLeaf = { title: string; url: string; icon: LucideIcon };

export const simulacoesNav: NavLeaf[] = [
  { title: "Painel de Cenários", url: "/", icon: LayoutDashboard },
  { title: "Cenário Anual", url: "/simulacao/anual", icon: CalendarRange },
  { title: "Cenário Mensal", url: "/simulacao/mensal", icon: CalendarDays },
  { title: "Cenário Diário", url: "/simulacao/diaria", icon: Clock },
];

export const cadastrosNav: NavLeaf[] = [
  { title: "Racks", url: "/cadastros/racks", icon: Boxes },
  { title: "Bens de Giro", url: "/cadastros/bens", icon: Package },
  { title: "Modelos", url: "/cadastros/modelos", icon: Bike },
  { title: "Família de Rack", url: "/cadastros/familias", icon: Layers },
  { title: "Lead Time", url: "/cadastros/leadtime", icon: Timer },
];

export const relatoriosNav: NavLeaf[] = [
  { title: "Projeção Anual", url: "/relatorios/anual", icon: BarChart3 },
  { title: "Projeção Mensal", url: "/relatorios/mensal", icon: BarChart3 },
  { title: "Projeção Diária", url: "/relatorios/diaria", icon: BarChart3 },
];
