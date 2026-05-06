import { semaforo } from "@/lib/mockData";
import { cn } from "@/lib/utils";

export function StatusBadge({ pct, showLabel = true }: { pct: number; showLabel?: boolean }) {
  const s = semaforo(pct);
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium")}>
      <span className={cn("h-2 w-2 rounded-full", s.color)} />
      {showLabel && <span className={s.text}>{pct}%</span>}
    </span>
  );
}

export function ProgressBar({ pct }: { pct: number }) {
  const s = semaforo(pct);
  return (
    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
      <div
        className={cn("h-full rounded-full transition-[width] duration-500 ease-out", s.color)}
        style={{ width: `${Math.min(100, pct)}%` }}
      />
    </div>
  );
}
