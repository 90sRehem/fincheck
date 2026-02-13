import { useMemo } from "react";
import { getVisiblePeriods } from "../lib/date-periods";
import type { Period, PeriodConfig } from "./period";
import { transactionsFiltersStore } from "./transactions-filters-store";
import { useTransactionsFilters } from "./use-transactions-filters";

const yearConfig: PeriodConfig = {
  type: "year",
  range: 0,
  formatOptions: { year: "numeric" },
  locale: "pt-BR",
};

type UseYearSelectorOptions = {
  onYearChange?: (year: number) => void;
  currentYear?: number;
};

export function useYearSelector(options?: UseYearSelectorOptions) {
  const filters = transactionsFiltersStore.useSelector((state) => state);
  const { updateFilters } = useTransactionsFilters();

  const today = new Date();
  const currentYear = options?.currentYear ?? filters.year ?? today.getFullYear();
  const currentMonth = filters.month ?? today.getMonth() + 1;

  const activePeriod: Period = {
    year: currentYear,
    month: currentMonth - 1, // Convert back to 0-indexed for date calculations
  };

  const visiblePeriods = useMemo(
    () => getVisiblePeriods(activePeriod, yearConfig),
    [activePeriod.year, activePeriod.month]
  );

  const handleYearChange = (year: number) => {
    if (options?.onYearChange) {
      options.onYearChange(year);
    } else {
      updateFilters({ year });
    }
  };

  const goToPreviousYear = () => {
    handleYearChange(currentYear - 1);
  };

  const goToNextYear = () => {
    handleYearChange(currentYear + 1);
  };

  const selectPeriod = (period: Period) => {
    handleYearChange(period.year);
  };

  return {
    visiblePeriods,
    activePeriod,
    goToPreviousYear,
    goToNextYear,
    selectPeriod,
  };
}
