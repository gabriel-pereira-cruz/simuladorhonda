import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Search, Download } from "lucide-react";
import { ProgressBar, StatusBadge } from "@/components/StatusBadge";
import { toast } from "sonner";

export type CrudRow = (string | number)[];

interface CrudPageProps {
  title: string;
  subtitle: string;
  columns: string[];
  initialRows: CrudRow[];
  withProgress?: boolean;
}

function cloneRows(rows: CrudRow[]): CrudRow[] {
  return rows.map((r) => [...r]);
}

function coerceCell(raw: string, colIndex: number, numCols: number, withProgress: boolean): string | number {
  const t = raw.trim();
  if (withProgress && colIndex === numCols - 1) {
    const n = parseFloat(t.replace(",", "."));
    return Number.isFinite(n) ? Math.min(100, Math.max(0, Math.round(n))) : 0;
  }
  if (/^-?\d+([.,]\d+)?$/.test(t)) {
    const n = parseFloat(t.replace(",", "."));
    return Number.isFinite(n) ? (Number.isInteger(n) ? Math.round(n) : Math.round(n * 100) / 100) : t;
  }
  return t || "—";
}

export function CrudPage({ title, subtitle, columns, initialRows, withProgress }: CrudPageProps) {
  const [rows, setRows] = useState<CrudRow[]>(() => cloneRows(initialRows));
  const [busy, setBusy] = useState<null | "export">(null);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formValues, setFormValues] = useState<string[]>(() => columns.map(() => ""));

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) => row.some((cell) => String(cell).toLowerCase().includes(q)));
  }, [rows, search]);

  const openNewDialog = () => {
    setFormValues(
      columns.map((_, i) => {
        if (withProgress && i === columns.length - 1) return "85";
        return "";
      }),
    );
    setDialogOpen(true);
  };

  const updateFormField = (index: number, value: string) => {
    setFormValues((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const saveNewRow = () => {
    const missing = columns.filter((_, i) => formValues[i]?.trim() === "");
    if (missing.length > 0) {
      toast.error("Preencha todos os campos", {
        description: `Faltam: ${missing.slice(0, 3).join(", ")}${missing.length > 3 ? "…" : ""}`,
      });
      return;
    }

    const newRow: CrudRow = columns.map((_, i) => coerceCell(formValues[i] ?? "", i, columns.length, !!withProgress));
    setRows((prev) => [...prev, newRow]);
    setDialogOpen(false);
    toast.success("Parâmetro salvo", {
      description: "Registro incluído na tabela desta sessão. Em produção, envie à API de cadastro.",
    });
  };

  const runExport = () => {
    setBusy("export");
    window.setTimeout(() => {
      setBusy(null);
      toast.success("Exportação simulada.", {
        description: "Em produção, o arquivo viria da API.",
      });
    }, 500);
  };

  return (
    <div className="mx-auto max-w-[1600px] space-y-8 p-6">
      <div className="rounded-xl border-l-4 border-l-primary/50 bg-primary/[0.04] px-4 py-3">
        <p className="text-sm font-medium text-foreground">Cadastros do simulador</p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          Estes parâmetros alimentam a simulação. Não representam estoque, ordem de compra ou operação em tempo real.
        </p>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{subtitle}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={busy !== null} onClick={() => runExport()}>
            <Download className="mr-2 h-4 w-4" />
            {busy === "export" ? "Exportando…" : "Exportar"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => openNewDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Novo parâmetro
          </Button>
        </div>
      </div>

      <Card className="rounded-2xl border border-border/80 bg-card/90 p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[240px] max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar parâmetro..."
              className="h-9 pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Filtrar tabela"
            />
          </div>
          <Badge variant="secondary">
            {filteredRows.length === rows.length
              ? `${rows.length} registros`
              : `${filteredRows.length} de ${rows.length}`}
          </Badge>
        </div>
      </Card>

      <Card className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/35">
              <tr>
                {columns.map((c) => (
                  <th key={c} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-10 text-center text-sm text-muted-foreground">
                    Nenhum registro corresponde à busca.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row, i) => (
                  <tr key={i} className="border-b border-border/50 transition-colors duration-150 hover:bg-muted/35">
                    {row.map((cell, j) => {
                      if (withProgress && j === row.length - 1 && typeof cell === "number") {
                        return (
                          <td key={j} className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-32">
                                <ProgressBar pct={cell} />
                              </div>
                              <StatusBadge pct={cell} />
                            </div>
                          </td>
                        );
                      }
                      return (
                        <td key={j} className="px-4 py-3 text-muted-foreground">
                          {cell}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Novo parâmetro</DialogTitle>
            <DialogDescription>
              Preencha todos os campos abaixo e salve para incluir uma nova linha neste cadastro.
              {withProgress ? (
                <span className="mt-1 block">
                  O último campo ({columns[columns.length - 1]}) deve ser um percentual de 0 a 100.
                </span>
              ) : null}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            {columns.map((col, i) => (
              <div key={col} className="grid gap-2">
                <Label htmlFor={`crud-field-${i}`}>{col}</Label>
                <Input
                  id={`crud-field-${i}`}
                  value={formValues[i] ?? ""}
                  onChange={(e) => updateFormField(i, e.target.value)}
                  placeholder={withProgress && i === columns.length - 1 ? "0–100" : "…"}
                  inputMode={withProgress && i === columns.length - 1 ? "numeric" : undefined}
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={() => saveNewRow()}>
              Salvar cadastro
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
