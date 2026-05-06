import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppLayout from "@/components/AppLayout";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import SimulacaoAnual from "./pages/SimulacaoAnual";
import SimulacaoMensal from "./pages/SimulacaoMensal";
import SimulacaoDiaria from "./pages/SimulacaoDiaria";
import { RacksPage, BensGiroPage, ModelosPage, FamiliasPage, LeadTimePage } from "./pages/Cadastros";
import { RelatorioAnual, RelatorioMensal, RelatorioDiario } from "./pages/Relatorios";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Index />} />
            <Route path="/simulacao/anual" element={<SimulacaoAnual />} />
            <Route path="/simulacao/mensal" element={<SimulacaoMensal />} />
            <Route path="/simulacao/diaria" element={<SimulacaoDiaria />} />
            <Route path="/cadastros/racks" element={<RacksPage />} />
            <Route path="/cadastros/bens" element={<BensGiroPage />} />
            <Route path="/cadastros/modelos" element={<ModelosPage />} />
            <Route path="/cadastros/familias" element={<FamiliasPage />} />
            <Route path="/cadastros/leadtime" element={<LeadTimePage />} />
            <Route path="/relatorios/anual" element={<RelatorioAnual />} />
            <Route path="/relatorios/mensal" element={<RelatorioMensal />} />
            <Route path="/relatorios/diaria" element={<RelatorioDiario />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
