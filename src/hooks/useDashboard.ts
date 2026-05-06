import { useState, useCallback, useEffect } from "react";
import { fetchDashboardData, type DashboardPayload } from "@/services/dashboard.service";
import { subscribeSimulacoesChanged } from "@/services/simulation.service";

type DashboardState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: DashboardPayload };

export function useDashboard() {
  const [state, setState] = useState<DashboardState>({ status: "loading" });

  const load = useCallback(async (signal?: AbortSignal) => {
    setState({ status: "loading" });
    try {
      const data = await fetchDashboardData(signal);
      setState({ status: "success", data });
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
      const message = e instanceof Error ? e.message : "Erro ao carregar dados.";
      setState({ status: "error", message });
    }
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    void load(ac.signal);
    return () => ac.abort();
  }, [load]);

  useEffect(
    () =>
      subscribeSimulacoesChanged(() => {
        void (async () => {
          try {
            const data = await fetchDashboardData();
            setState((s) => (s.status === "success" ? { status: "success", data } : s));
          } catch {
            /* mantém estado atual */
          }
        })();
      }),
    [],
  );

  return { state, reload: load };
}
