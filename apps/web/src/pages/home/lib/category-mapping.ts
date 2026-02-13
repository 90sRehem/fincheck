import type { Colors } from "@fincheck/design-system";

export type CategoryMapping = {
  color: Colors;
  icon: string;
};

/**
 * Mapeamento de categorias para cores e ícones padrão
 * Baseado nos padrões observados nas transações existentes
 */
export const CATEGORY_MAPPINGS: Record<string, CategoryMapping> = {
  // Alimentação e compras
  food: { color: "orange", icon: "food" },
  grocery: { color: "indigo", icon: "grocery" },

  // Casa
  home: { color: "orange", icon: "home" },

  // Educação
  education: { color: "grape", icon: "education" },

  // Entretenimento
  entertainment: { color: "violet", icon: "entertainment" },

  // Roupas
  clothing: { color: "pink", icon: "clothing" },

  // Saúde
  health: { color: "cyan", icon: "health" },

  // Transporte
  transport: { color: "yellow", icon: "transport" },

  // Viagem
  trip: { color: "teal", icon: "trip" },

  // Receita
  revenue: { color: "teal", icon: "revenue" },

  // Despesa genérica
  expense: { color: "red", icon: "expense" },
};

/**
 * Retorna o mapeamento de cor e ícone para uma categoria
 * Se a categoria não existir no mapeamento, retorna valores padrão
 */
export function getCategoryMapping(category?: string): CategoryMapping {
  if (!category) {
    return { color: "gray", icon: "expense" };
  }

  return (
    CATEGORY_MAPPINGS[category] ?? {
      color: "gray",
      icon: category,
    }
  );
}
