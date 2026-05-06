import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { AlertTriangle, Target, FlaskConical, Layers, Factory, Boxes } from "lucide-react";
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

  const secondaryIconFor = (label: string) => {
    const l = label.toLowerCase();
    if (l.includes("cenár")) return Layers;
    if (l.includes("produ")) return Factory;
    if (l.includes("famíl")) return Boxes;
    return Target;
  };

  const hintToChips = (hint?: string) =>
    (hint ?? "")
      .split("·")
      .map((x) => x.trim())
      .filter(Boolean)
      .slice(0, 4);

  return (
    <section id="resumo" aria-label="Resumo executivo" className="mb-0 scroll-mt-24">
      <div className="mb-5 flex items-center gap-3" aria-hidden>
        <div className="h-1.5 w-16 shrink-0 rounded-full bg-primary" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-5">
        <Card className="relative overflow-hidden rounded-2xl border border-border/80 bg-card p-6 shadow-sm transition-shadow duration-200 hover:shadow-md lg:col-span-5">
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
            <div className="mt-4">
              <ProgressBar pct={aderencia} />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Limitada por <span className="font-semibold text-foreground">{limitadaPor}</span>
            </p>
            {hipotese && (
              <div className="mt-4 flex items-start gap-2 border-t border-border/60 pt-3">
                <FlaskConical className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <p className="text-xs leading-relaxed text-muted-foreground">
                  <span className="font-semibold text-foreground">Hipótese:</span> {hipotese}
                </p>
              </div>
            )}
          </div>
        </Card>

        <Card className="relative rounded-2xl border border-warning/35 bg-amber-50 p-6 shadow-sm dark:bg-amber-950/25 dark:border-warning/40 transition-shadow duration-200 hover:shadow-md lg:col-span-4">
          <div className="absolute inset-y-4 left-0 w-0.5 rounded-full bg-warning" aria-hidden />
          <div className="pl-3">
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs font-semibold text-amber-900 dark:text-amber-200">Restrição principal</p>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-warning/25 text-amber-800 dark:text-amber-100">
                <AlertTriangle className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="font-display text-2xl font-semibold leading-tight tracking-tight text-foreground">
                Família {restricao.familia}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                Rack <span className="font-mono font-semibold text-foreground">{restricao.rack}</span>
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="font-display text-4xl font-semibold tabular-nums text-amber-700 dark:text-amber-300">
                {restricao.impacto}%
              </span>
              <span className="text-xs text-muted-foreground">do gap projetado</span>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              <span className="font-semibold text-foreground">Causa:</span> {restricao.causa}
            </p>
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:col-span-3 lg:grid-cols-1 lg:gap-3">
          {secundarios.slice(0, 3).map((k) => (
            <div
              key={k.label}
              className={`group relative overflow-hidden rounded-2xl border px-4 py-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                k.tone === "danger"
                  ? "border-destructive/25 bg-destructive/5 hover:border-destructive/35"
                  : "border-border/70 bg-card hover:border-primary/25"
              }`}
            >
              <div
                className={`absolute inset-y-4 left-0 w-1 rounded-full ${
                  k.tone === "danger" ? "bg-destructive/70" : "bg-primary/70"
                }`}
                aria-hidden
              />
              <div className="pl-3">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-[11px] font-semibold tracking-wide text-muted-foreground">{k.label}</p>
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors ${
                      k.tone === "danger"
                        ? "bg-destructive/10 text-destructive"
                        : "bg-primary/12 text-primary group-hover:bg-primary/18"
                    }`}
                  >
                    {(() => {
                      const Icon = secondaryIconFor(k.label);
                      return <Icon className="h-4 w-4" aria-hidden />;
                    })()}
                  </div>
                </div>

                <p
                  className={`mt-3 font-display text-3xl font-semibold tabular-nums leading-none tracking-tight ${
                    k.tone === "danger" ? "text-destructive" : "text-foreground"
                  }`}
                >
                  {k.value}
                </p>

                {k.hint ? (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {hintToChips(k.hint).map((chip) => (
                      <span
                        key={chip}
                        className={`rounded-full px-2 py-1 text-[10px] font-medium leading-none ${
                          k.tone === "danger"
                            ? "bg-destructive/10 text-destructive"
                            : "bg-muted/55 text-muted-foreground"
                        }`}
                      >
                        {chip}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
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
