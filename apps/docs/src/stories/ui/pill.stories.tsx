import type { Meta, StoryObj } from "@storybook/react-vite";
import { Pill, General } from "@fincheck/design-system";
import { useState } from "react";

const filterItems = [
  {
    value: "transactions",
    icon: <General.Transactions />,
    label: "Transações",
  },
  {
    value: "revenue",
    icon: <General.Revenue />,
    label: "Receitas",
  },
  {
    value: "expense",
    icon: <General.Expense />,
    label: "Despesas",
  },
] as const;

function PillDemo() {
  const [selectedFilter, setSelectedFilter] = useState(filterItems[0].value);
  const currentItem = filterItems.find((item) => item.value === selectedFilter) ?? filterItems[0];

  return (
    <Pill value={selectedFilter} onValueChange={setSelectedFilter}>
      <Pill.Trigger>
        {currentItem.icon}
        {currentItem.label}
      </Pill.Trigger>
      <Pill.Content>
        {filterItems.map((item) => (
          <Pill.Item key={item.value} value={item.value}>
            <Pill.ItemIcon>{item.icon}</Pill.ItemIcon>
            <Pill.ItemText>{item.label}</Pill.ItemText>
          </Pill.Item>
        ))}
      </Pill.Content>
    </Pill>
  );
}

function PillUncontrolled() {
  return (
    <Pill defaultValue="revenue" onValueChange={(value) => console.log("Selected:", value)}>
      <Pill.Trigger>
        <General.Revenue />
        Receitas
      </Pill.Trigger>
      <Pill.Content>
        {filterItems.map((item) => (
          <Pill.Item key={item.value} value={item.value}>
            <Pill.ItemIcon>{item.icon}</Pill.ItemIcon>
            <Pill.ItemText>{item.label}</Pill.ItemText>
          </Pill.Item>
        ))}
      </Pill.Content>
    </Pill>
  );
}

function PillWithoutArrow() {
  return (
    <Pill defaultValue="transactions">
      <Pill.Trigger showArrow={false}>
        <General.Transactions />
        Transações
      </Pill.Trigger>
      <Pill.Content>
        {filterItems.map((item) => (
          <Pill.Item key={item.value} value={item.value}>
            <Pill.ItemIcon>{item.icon}</Pill.ItemIcon>
            <Pill.ItemText>{item.label}</Pill.ItemText>
          </Pill.Item>
        ))}
      </Pill.Content>
    </Pill>
  );
}

const meta = {
  title: "Patterns/Pill",
  component: PillDemo,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof PillDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <PillDemo />,
};

export const Uncontrolled: Story = {
  render: () => <PillUncontrolled />,
};

export const WithoutArrow: Story = {
  render: () => <PillWithoutArrow />,
};
