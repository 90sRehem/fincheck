export type Colors =
  | "gray"
  | "red"
  | "pink"
  | "grape"
  | "violet"
  | "indigo"
  | "blue"
  | "cyan"
  | "teal"
  | "green"
  | "lime"
  | "yellow"
  | "orange";

/* =========================================================
 * Categories
 * ======================================================= */

export const categories = {
  food: "Alimentação",
  health: "Saúde",
  transport: "Transporte",
  shopping: "Compras",
  savings: "Finanças",
  account: "Conta corrente",
} as const;

export type CategoryKey = keyof typeof categories;
export type CategoryLabel = (typeof categories)[CategoryKey];

/* =========================================================
 * Entry Types (Despesa / Receita / Conta)
 * ======================================================= */

export const entryTypes = {
  expense: "expense",
  income: "income",
  account: "account",
} as const;

export type EntryType = (typeof entryTypes)[keyof typeof entryTypes];

/* =========================================================
 * Card Value (sinal visual / semântico)
 * ======================================================= */

export const cardValueTypes = {
  positive: "positive",
  negative: "negative",
} as const;

export type CardValueType =
  (typeof cardValueTypes)[keyof typeof cardValueTypes];

/* =========================================================
 * Rules by Entry Type
 * (aqui mora a inteligência de domínio)
 * ======================================================= */

export const entryTypeRules = {
  expense: {
    cardValue: cardValueTypes.negative,
    defaultCategory: "food" as const,
  },
  income: {
    cardValue: cardValueTypes.positive,
    defaultCategory: "account" as const,
  },
  account: {
    cardValue: cardValueTypes.positive,
    defaultCategory: "account" as const,
  },
} as const;

export type EntryTypeRules = typeof entryTypeRules;

export type CardValueByEntry<T extends EntryType> =
  EntryTypeRules[T]["cardValue"];

export type DefaultCategoryByEntry<T extends EntryType> =
  EntryTypeRules[T]["defaultCategory"];

/* =========================================================
 * Core Entity
 * ======================================================= */

export type FinancialEntry<T extends EntryType = EntryType> = {
  id?: string;
  type: T;
  category: CategoryKey;
  amount: number;
  cardValue: CardValueByEntry<T>;
  date?: Date;
};

/* =========================================================
 * Factory Helpers (opcional, mas recomendado)
 * ======================================================= */

type BaseCreateEntryParams = {
  id: string;
  amount: number;
  date?: Date;
};

export function createExpense(
  params: BaseCreateEntryParams & {
    category?: Exclude<CategoryKey, "account">;
  },
): FinancialEntry<"expense"> {
  return {
    id: params.id,
    type: "expense",
    amount: params.amount,
    date: params.date,
    category: params.category ?? entryTypeRules.expense.defaultCategory,
    cardValue: entryTypeRules.expense.cardValue,
  };
}

export function createIncome(
  params: BaseCreateEntryParams & {
    category?: CategoryKey;
  },
): FinancialEntry<"income"> {
  return {
    id: params.id,
    type: "income",
    amount: params.amount,
    date: params.date,
    category: params.category ?? entryTypeRules.income.defaultCategory,
    cardValue: entryTypeRules.income.cardValue,
  };
}

export function createAccountBalance(
  params: BaseCreateEntryParams,
): FinancialEntry<"account"> {
  return {
    id: params.id,
    type: "account",
    amount: params.amount,
    date: params.date,
    category: entryTypeRules.account.defaultCategory,
    cardValue: entryTypeRules.account.cardValue,
  };
}

/* =========================================================
 * UI Helpers (ex: Design System)
 * ======================================================= */

export function getCategoryLabel(category: CategoryKey): CategoryLabel {
  return categories[category];
}

export function isNegative(entry: FinancialEntry): boolean {
  return entry.cardValue === cardValueTypes.negative;
}
