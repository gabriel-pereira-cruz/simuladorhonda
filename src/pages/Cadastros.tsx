import { CrudPage } from "@/components/CrudPage";
import { racks, modelos, familiasRack } from "@/lib/mockData";

export function RacksPage() {
  return (
    <CrudPage
      title="Racks"
      subtitle="Parâmetros de racks usados no cálculo de disponibilidade."
      columns={["Código", "Descrição", "Família", "Quantidade total", "Disponibilidade Projetada", "Lead Time", "Condição no Cenário"]}
      initialRows={racks.map((r) => [
        r.codigo, r.descricao, r.familia, r.quantidade, r.disponivel, `${r.leadTime} dias`,
        Math.round((r.disponivel / r.quantidade) * 100),
      ])}
      withProgress
    />
  );
}

export function BensGiroPage() {
  return (
    <CrudPage
      title="Bens de Giro"
      subtitle="Parâmetros de bens de giro por família de rack (impacto projetado no cenário)."
      columns={["Código", "Descrição", "Família vinculada", "Estoque Simulado", "Mínimo paramétrico", "Giro/Mês (hipótese)", "Condição no Cenário"]}
      initialRows={[
        ["BG-001", "Pallets PBR", "F-CHASSI", 1240, 800, 4, 92],
        ["BG-002", "Caixas Plásticas P", "F-PLAST", 3200, 2000, 6, 88],
        ["BG-003", "Carrinhos Industriais", "F-MOTOR", 180, 200, 3, 65],
        ["BG-004", "Berços de Motor", "F-MOTOR", 420, 350, 5, 95],
        ["BG-005", "Suportes de Tanque", "F-TANQUE", 240, 300, 4, 58],
        ["BG-006", "Containers Metálicos", "F-RODA", 96, 80, 2, 91],
      ]}
      withProgress
    />
  );
}

export function ModelosPage() {
  return (
    <CrudPage
      title="Modelos de Motocicleta"
      subtitle="Modelos usados nas hipóteses de mix do cenário."
      columns={["Modelo", "Família", "Cilindrada", "Linha", "Status no cenário", "Mix Plano (%)"]}
      initialRows={modelos.map((m, i) => [
        m,
        ["Street", "Trail", "Scooter", "Cub"][i % 4],
        `${[110, 125, 160, 300][i % 4]}cc`,
        `Linha ${(i % 3) + 1}`,
        i % 5 === 0 ? "Pré-série" : "Ativo",
        Math.round(70 + (i * 3) % 30),
      ])}
      withProgress
    />
  );
}

export function FamiliasPage() {
  return (
    <CrudPage
      title="Família de Rack"
      subtitle="Agrupamento funcional usado para identificar a restrição principal do cenário."
      columns={["Código", "Descrição", "Qtd. Racks", "Modelos vinculados", "Cobertura projetada"]}
      initialRows={familiasRack.map((f, i) => [
        f, ["Chassi", "Motor", "Roda", "Tanque", "Plásticos"][i],
        racks.filter((r) => r.familia === f).length || 1, 4 + i, Math.round(60 + i * 8),
      ])}
      withProgress
    />
  );
}

export function LeadTimePage() {
  return (
    <CrudPage
      title="Lead Time"
      subtitle="Tempos de reposição por família (variável-chave da hipótese do cenário)."
      columns={["Família", "Fornecedor", "Lead Time (dias)", "Variação", "Última atualização do parâmetro", "Confiabilidade da hipótese"]}
      initialRows={familiasRack.map((f, i) => [
        f, `Fornecedor ${["Alpha", "Beta", "Gama", "Delta", "Omega"][i]}`,
        [12, 14, 9, 18, 21][i], `±${[1, 2, 1, 3, 4][i]} dias`, "02/05/2026",
        Math.round(95 - i * 7),
      ])}
      withProgress
    />
  );
}
