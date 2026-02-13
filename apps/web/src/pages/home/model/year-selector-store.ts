import type { PeriodConfig } from "./period";
import { createPeriodSelectorStore } from "./period-selector-store";
const yearConfig: PeriodConfig = {
  type: "year",
  range: 0,
  formatOptions: { year: "numeric" },
  locale: "pt-BR",
};
const yearSelector = createPeriodSelectorStore(yearConfig);
export const yearSelectorStore = yearSelector.store;
export const yearSelectorActions = {
  goToPreviousYear: yearSelector.actions.goToPrevious,
  goToNextYear: yearSelector.actions.goToNext,
  selectPeriod: yearSelector.actions.selectPeriod,
};
export const useYearSelector = yearSelector.useSelector;
