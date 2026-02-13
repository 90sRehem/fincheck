import { createStore } from "@/shared/lib";
import { getVisiblePeriods } from "../lib/date-periods";
import type { PeriodConfig, Period, VisiblePeriod } from "./period";

export type PeriodSelectorState = {
	activePeriod: Period;
	visiblePeriods: VisiblePeriod[];
};

export function createPeriodSelectorStore(config: PeriodConfig) {
	const today = new Date();

	const initialState = {
		activePeriod: {
			year: today.getFullYear(),
			month: today.getMonth(),
		},
		visiblePeriods: getVisiblePeriods(
			{
				year: today.getFullYear(),
				month: today.getMonth(),
			},
			config,
		),
	};

	const store = createStore(initialState);

	const actions = {
		goToPrevious() {
			const { activePeriod } = store.getState();
			const date =
				config.type === "month"
					? new Date(activePeriod.year, activePeriod.month - 1)
					: new Date(activePeriod.year - 1, activePeriod.month);

			const newPeriod = {
				year: date.getFullYear(),
				month: date.getMonth(),
			};

			store.setState({
				activePeriod: newPeriod,
				visiblePeriods: getVisiblePeriods(newPeriod, config),
			});
		},
		goToNext() {
			const { activePeriod } = store.getState();
			const date =
				config.type === "month"
					? new Date(activePeriod.year, activePeriod.month + 1)
					: new Date(activePeriod.year + 1, activePeriod.month);

			const newPeriod = {
				year: date.getFullYear(),
				month: date.getMonth(),
			};

			store.setState({
				activePeriod: newPeriod,
				visiblePeriods: getVisiblePeriods(newPeriod, config),
			});
		},
		selectPeriod(period: Period) {
			store.setState({
				activePeriod: period,
				visiblePeriods: getVisiblePeriods(period, config),
			});
		},
	};

	return { store, actions, useSelector: store.useSelector };
}
