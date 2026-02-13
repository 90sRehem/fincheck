import { Tabs } from "@fincheck/design-system";
import { useYearSelector } from "../model/use-year-selector";

type YearSelectorProps = {
  onYearChange?: (year: number) => void;
  currentYear?: number;
};

export function YearSelector({ onYearChange, currentYear }: YearSelectorProps) {
  const { visiblePeriods, goToPreviousYear, goToNextYear, selectPeriod } =
    useYearSelector({ onYearChange, currentYear });

  return (
    <Tabs>
      <Tabs.PrevButton onClick={goToPreviousYear} />
      <Tabs.List>
        {visiblePeriods.map((period, index) => (
          <Tabs.Item
            key={`${period.year}-${index}`}
            value={period.label}
            className="flex-1"
            active={period.isActive}
            onClick={() => selectPeriod(period)}
          >
            {period.label}
          </Tabs.Item>
        ))}
      </Tabs.List>
      <Tabs.NextButton onClick={goToNextYear} />
    </Tabs>
  );
}
