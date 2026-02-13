import type { PeriodConfig } from "./period";
import { createPeriodSelectorStore } from "./period-selector-store";

const monthConfig: PeriodConfig = {
  type: "month",
  range: 1,
  formatOptions: { month: "short" },
  locale: "pt-BR",
};

const monthSelector = createPeriodSelectorStore(monthConfig);

export const monthSelectorStore = monthSelector.store;

export const monthSelectorActions = {
  goToPreviousMonth: monthSelector.actions.goToPrevious,
  goToNextMonth: monthSelector.actions.goToNext,
  selectPeriod: monthSelector.actions.selectPeriod,
};

export const useMonthSelector = monthSelector.useSelector;
