import { FlaskConical, AlertTriangle } from "lucide-react";

interface Hipotese {
  leadTime: string;
  giro: string;
  mix: string;
}

interface Props {
  pergunta: string;
  hipotese: Hipotese;
  restricao?: {
    familia: string;
    rack: string;
    impacto: number; // % do gap causado
    causa: string;
  };
}

export function HipoteseBanner({ pergunta, hipotese, restricao }: Props) {
  return (
    <div className="mb-5 space-y-3">
      <div className="rounded-md border border-primary/30 bg-primary/5 p-4">
        <div className="flex items-start gap-3">
          <FlaskConical className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-[10px] uppercase tracking-wider font-semibold text-primary">Pergunta da Simulação</p>
            <p className="text-sm font-medium mt-0.5">{pergunta}</p>
            <p className="text-[11px] text-muted-foreground mt-2">
              <span className="font-semibold">Hipótese:</span> Lead time {hipotese.leadTime} · % de giro {hipotese.giro} · Mix {hipotese.mix}.
              Resultados são <span className="font-semibold">projeções</span> dependentes destas parametrizações — não refletem operação em tempo real.
            </p>
          </div>
        </div>
      </div>

      {restricao && (
        <div className="rounded-md border border-warning/40 bg-warning/5 p-3 flex items-start gap-3">
          <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
          <div className="text-xs">
            <span className="font-semibold uppercase tracking-wider text-[10px] text-warning">Restrição Principal do Cenário · </span>
            Família <span className="font-semibold">{restricao.familia}</span> (rack {restricao.rack}) responde por
            <span className="font-semibold"> {restricao.impacto}% </span> do não atendimento — causa: {restricao.causa}.
          </div>
        </div>
      )}
    </div>
  );
}
