import { useNavigate } from "@tanstack/react-router";
import { useCallback } from "react";
import {
  transactionsFiltersStore,
  transactionsFiltersStoreActions,
  type TransactionsFiltersState,
} from "./transactions-filters-store";

export function useTransactionsFilters() {
  const navigate = useNavigate({ from: "/" });
  const state = transactionsFiltersStore.useSelector((state) => state);

  const updateFilters = useCallback(
    (updates: Partial<TransactionsFiltersState>) => {
      transactionsFiltersStoreActions.updateFilters(updates);

      const updatedState = transactionsFiltersStore.getState();
      const searchParams = {
        accountId: updatedState.accountId,
        year: updatedState.year,
        month: updatedState.month,
        type: updatedState.type === "transactions" ? undefined : updatedState.type,
      } as const;

      navigate({
        to: "/",
        search: (prev) => ({
          ...prev,
          ...searchParams,
        }),
        replace: true,
      });
    },
    [navigate],
  );

  const clearFilters = useCallback(() => {
    transactionsFiltersStoreActions.clearFilters();
    navigate({
      to: "/",
      search: {},
      replace: true,
    });
  }, [navigate]);

  return {
    filters: state,
    updateFilters,
    clearFilters,
  };
}
