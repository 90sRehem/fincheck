import { createStore } from "@/shared/lib/core";

export type TransactionTypeFilter = "transactions" | "expense" | "revenue";

export type TransactionsFiltersState = {
  accountId: string | undefined;
  year: number | undefined;
  type: TransactionTypeFilter;
  month: number | undefined;
};

function getInitialState(): TransactionsFiltersState {
  const params = new URLSearchParams(globalThis.location.search);
  return {
    accountId: params.get("accountId") || undefined,
    year: params.get("year") ? Number(params.get("year")) : undefined,
    type: (params.get("type") as TransactionTypeFilter) || "transactions",
    month: params.get("month") ? Number(params.get("month")) : undefined,
  };
}

export const transactionsFiltersStore =
  createStore<TransactionsFiltersState>(getInitialState());

export const transactionsFiltersStoreActions = {
  updateFilters(updates: Partial<TransactionsFiltersState>) {
    transactionsFiltersStore.setState((state) => ({
      ...state,
      ...updates,
    }));
  },
  clearFilters() {
    transactionsFiltersStore.setState({
      accountId: undefined,
      year: undefined,
      type: "transactions",
      month: undefined,
    });
  },
};
