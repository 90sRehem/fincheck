import type { Meta, StoryObj } from "@storybook/react-vite";
import { CardLarge as CardRoot } from "@fincheck/design-system";
import type { CardProps } from "@fincheck/design-system";
import { formatBRL } from "../utils";

type CardLargeProps = {
  title: string;
  value: number;
} & CardProps;

function CardLarge({
  color,
  icon,
  title,
  value,
  hideAmount,
}: Readonly<CardLargeProps>) {
  return (
    <div className="flex flex-row items-center justify-center h-full">
      <CardRoot color={color} icon={icon} hideAmount={hideAmount}>
        <CardRoot.Content>
          <CardRoot.Header>{title}</CardRoot.Header>
          <CardRoot.Balance>{formatBRL(value)}</CardRoot.Balance>
        </CardRoot.Content>
      </CardRoot>
    </div>
  );
}

const meta = {
  title: "Patterns/Card Large",
  component: CardLarge,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    color: {
      control: { type: "select" },
      options: [
        "gray",
        "red",
        "pink",
        "grape",
        "purple",
        "indigo",
        "blue",
        "cyan",
        "teal",
        "green",
        "lime",
        "yellow",
        "orange",
      ],
      description: "Color theme for the card border",
      defaultValue: "orange",
    },
    icon: {
      control: { type: "select" },
      options: ["money", "investment", "account"],
      description: "Icon to display in the card",
      defaultValue: "money",
    },
    title: {
      control: { type: "text" },
      description: "Title to display",
      defaultValue: "Conta Corrente",
    },
    value: {
      control: { type: "number" },
      description: "Value to display",
      defaultValue: 2500.5,
    },
    hideAmount: {
      control: { type: "boolean" },
      description: "Hide the amount",
      defaultValue: true,
    },
  },
} satisfies Meta<typeof CardLarge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    color: "green",
    icon: "food",
    title: "Conta Corrente",
    value: 2500.5,
  },
};
