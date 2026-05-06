import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { AlertTriangle, Target, FlaskConical } from "lucide-react";
import { ProgressBar } from "@/components/StatusBadge";
import { semaforo } from "@/lib/mockData";

/**
 * Bloco "Resumo Executivo" padronizado: KPI principal dominante + Restrição Principal
 * + secundários compactos. Usado em Dashboard, Anual, Mensal, Diária.
 */
interface RestricaoProps {
  familia: string;
  rack: string;
  impacto: number;
  causa: string;
}

interface Props {
  aderencia: number;
  aderenciaLabel?: string;
  limitadaPor: string; // ex.: "F-PLAST · RK-005"
  hipotese?: string;   // ex.: "Lead time 14d · Giro 85% · Mix Ki26 v3"
  restricao: RestricaoProps;
  secundarios?: { label: string; value: ReactNode; hint?: string; tone?: "default" | "danger" }[];
}

export function ScenarioSummary({
  aderencia,
  aderenciaLabel = "Aderência projetada do cenário",
  limitadaPor,
  hipotese,
  restricao,
  secundarios = [],
}: Props) {
  const s = semaforo(aderencia);
  return (
    <section id="resumo" aria-label="Resumo executivo" className="mb-0 scroll-mt-24">
      <div className="mb-5 flex items-center gap-3" aria-hidden>
        <div className="h-1.5 w-16 shrink-0 rounded-full bg-primary" />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:gap-6">
        <Card className="relative overflow-hidden rounded-2xl border border-border/80 bg-card p-7 shadow-sm transition-shadow duration-200 hover:shadow-md lg:col-span-5">
          <div className="absolute inset-y-4 left-0 w-1 rounded-full bg-primary" aria-hidden />
          <div className="pl-4">
            <div className="flex items-start justify-between gap-3">
              <p className="text-xs font-medium text-muted-foreground">{aderenciaLabel}</p>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Target className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-3">
              <span
                className={`font-display text-6xl font-semibold tracking-tight leading-none tabular-nums sm:text-7xl ${s.text}`}
              >
                {aderencia}
                <span className="text-[0.45em] font-medium opacity-80">%</span>
              </span>
              <span className={`h-3.5 w-3.5 shrink-0 rounded-full ring-2 ring-background ${s.color}`} aria-hidden />
            </div>
            <div className="mt-5">
              <ProgressBar pct={aderencia} />
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Limitada por <span className="font-semibold text-foreground">{limitadaPor}</span>
            </p>
            {hipotese && (
              <div className="mt-5 flex items-start gap-2 border-t border-border/60 pt-4">
                <FlaskConical className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <p className="text-xs leading-relaxed text-muted-foreground">
                  <span className="font-semibold text-foreground">Hipótese:</span> {hipotese}
                </p>
              </div>
            )}
          </div>
        </Card>

        <Card className="relative rounded-2xl border border-warning/35 bg-amber-50 p-7 shadow-sm dark:bg-amber-950/25 dark:border-warning/40 transition-shadow duration-200 hover:shadow-md lg:col-span-4">
          <div className="absolute inset-y-4 left-0 w-0.5 rounded-full bg-warning" aria-hidden />
          <div className="pl-3">
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs font-semibold text-amber-900 dark:text-amber-200">Restrição principal</p>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-warning/25 text-amber-800 dark:text-amber-100">
                <AlertTriangle className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="font-display text-2xl font-semibold leading-tight tracking-tight text-foreground">
                Família {restricao.familia}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                Rack <span className="font-mono font-semibold text-foreground">{restricao.rack}</span>
              </div>
            </div>
            <div className="mt-5 flex items-baseline gap-2">
              <span className="font-display text-4xl font-semibold tabular-nums text-amber-700 dark:text-amber-300">
                {restricao.impacto}%
              </span>
              <span className="text-xs text-muted-foreground">do gap projetado</span>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
              <span className="font-semibold text-foreground">Causa:</span> {restricao.causa}
            </p>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-3 lg:col-span-3 lg:grid-cols-1 lg:gap-3">
          {secundarios.slice(0, 3).map((k) => (
            <div
              key={k.label}
              className="rounded-xl border border-border/60 bg-muted/30 px-4 py-3.5 transition-colors duration-200 hover:bg-muted/45"
            >
              <p className="text-[11px] font-medium text-muted-foreground">{k.label}</p>
              <p
                className={`mt-1 font-display text-2xl font-semibold tabular-nums leading-none tracking-tight ${
                  k.tone === "danger" ? "text-destructive" : "text-foreground"
                }`}
              >
                {k.value}
              </p>
              {k.hint && <p className="mt-1.5 text-[11px] leading-snug text-muted-foreground">{k.hint}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function formatSectionEyebrow(zone: string): string | null {
  const t = zone.trim();
  if (t.length <= 1) return null;
  const stripped = t.replace(/^Zona\s*\d+\s*[·.]\s*/i, "").trim();
  return stripped.length > 0 ? stripped : t;
}

export function SectionHeader({
  zone,
  title,
  hint,
  right,
}: {
  zone: string;
  title: string;
  hint?: string;
  right?: ReactNode;
}) {
  const eyebrow = formatSectionEyebrow(zone);

  return (
    <div className="mb-8 flex items-end justify-between gap-4 border-b border-border/60 pb-5">
      <div className="min-w-0">
        {eyebrow && (
          <div className="mb-2 flex items-center gap-2">
            <div className="h-1 w-5 shrink-0 rounded-full bg-primary" aria-hidden />
            <p className="text-xs font-medium text-primary">{eyebrow}</p>
          </div>
        )}
        <h3 className="font-display text-lg font-semibold tracking-tight text-foreground sm:text-xl">{title}</h3>
        {hint && <p className="mt-2.5 max-w-3xl text-sm leading-relaxed text-muted-foreground">{hint}</p>}
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  );
}
