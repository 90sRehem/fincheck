import { useMemo } from "react";
import { getVisiblePeriods } from "../lib/date-periods";
import type { Period, PeriodConfig } from "./period";
import { transactionsFiltersStore } from "./transactions-filters-store";
import { useTransactionsFilters } from "./use-transactions-filters";

const monthConfig: PeriodConfig = {
  type: "month",
  range: 1,
  formatOptions: { month: "short" },
  locale: "pt-BR",
};

export function useMonthSelector() {
  const filters = transactionsFiltersStore.useSelector((state) => state);
  const { updateFilters } = useTransactionsFilters();

  const today = new Date();
  const currentMonth = filters.month ?? today.getMonth() + 1;

  const activePeriod: Period = {
    year: filters.year ?? today.getFullYear(),
    month: currentMonth - 1, // Convert back to 0-indexed for date calculations
  };

  const visiblePeriods = useMemo(
    () => getVisiblePeriods(activePeriod, monthConfig),
    [activePeriod.year, activePeriod.month]
  );

  const goToPreviousMonth = () => {
    const date = new Date(activePeriod.year, activePeriod.month - 1);
    updateFilters({
      year: date.getFullYear(),
      month: date.getMonth() + 1, // Convert to 1-indexed for storage
    });
  };

  const goToNextMonth = () => {
    const date = new Date(activePeriod.year, activePeriod.month + 1);
    updateFilters({
      year: date.getFullYear(),
      month: date.getMonth() + 1, // Convert to 1-indexed for storage
    });
  };

  const selectPeriod = (period: Period) => {
    updateFilters({
      year: period.year,
      month: period.month + 1, // Convert to 1-indexed for storage
    });
  };

  return {
    visiblePeriods,
    activePeriod,
    goToPreviousMonth,
    goToNextMonth,
    selectPeriod,
  };
}
