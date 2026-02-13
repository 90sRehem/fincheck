import { Tabs } from "@fincheck/design-system";
import { useMonthSelector } from "../model/use-month-selector";

export function MonthSelector() {
  const { visiblePeriods, goToPreviousMonth, goToNextMonth, selectPeriod } =
    useMonthSelector();

  return (
    <Tabs>
      <Tabs.PrevButton onClick={goToPreviousMonth} />
      <Tabs.List>
        {visiblePeriods.map((period, index) => (
          <Tabs.Item
            key={`${period.year}-${period.month}-${index}`}
            value={period.label}
            className="flex-1"
            active={period.isActive}
            onClick={() => selectPeriod(period)}
          >
            {period.label}
          </Tabs.Item>
        ))}
      </Tabs.List>
      <Tabs.NextButton onClick={goToNextMonth} />
    </Tabs>
  );
}
