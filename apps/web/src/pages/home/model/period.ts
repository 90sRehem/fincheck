export type PeriodType = "month" | "year";

export type Period = {
  year: number;
  month: number;
};

export type VisiblePeriod = Period & {
  label: string;
  isActive: boolean;
};

export type PeriodConfig = {
  type: PeriodType;
  range: number;
  formatOptions: Intl.DateTimeFormatOptions;
  locale?: Intl.LocalesArgument;
};
