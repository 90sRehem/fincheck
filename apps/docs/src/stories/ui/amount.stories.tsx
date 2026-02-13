import type { Meta, StoryObj } from "@storybook/react-vite";
import { Amount as AmountComponent } from "@fincheck/design-system";
import type { AmountProps } from "@fincheck/design-system";
import { formatBRL } from "../utils";

function Amount({
  value,
  variant,
  state,
  className,
}: Readonly<AmountProps & { value: string }>) {
  return (
    <AmountComponent variant={variant} state={state} className={className}>
      {formatBRL(Number(value))}
    </AmountComponent>
  );
}

const meta = {
  title: "UI/Amount",
  component: Amount,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    value: {
      control: { type: "text" },
      description: "Value to display",
      defaultValue: "1000",
    },
    variant: {
      control: { type: "select" },
      options: ["income", "expense", "default"],
      description: "Variant to display",
      defaultValue: "default",
    },
    state: {
      control: { type: "select" },
      options: ["show", "hide"],
      description: "State to display",
      defaultValue: "show",
    },
  },
} satisfies Meta<typeof Amount>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: "1000",
    variant: "default",
    state: "hide",
  },
};
