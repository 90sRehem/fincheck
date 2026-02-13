import type { Period, PeriodConfig, VisiblePeriod } from "../model/period";

function formatPeriod(
	date: Date,
	locale: Intl.LocalesArgument = "pt-BR",
	options: Intl.DateTimeFormatOptions = {},
) {
	return new Intl.DateTimeFormat(locale, options).format(date);
}

export function getVisiblePeriods(
	current: Period,
	config: PeriodConfig,
): VisiblePeriod[] {
	const { type, range, locale, formatOptions } = config;

	return Array.from({ length: range * 2 + 1 }, (_, i) => {
		const offset = i - range;
		const date =
			type === "month"
				? new Date(current.year, current.month + offset)
				: new Date(current.year + offset, current.month);
		const label = formatPeriod(date, locale, formatOptions)
			.replace(".", "")
			.toUpperCase();
		return {
			year: date.getFullYear(),
			month: date.getMonth(),
			label,
			isActive: offset === 0,
		};
	});
}
