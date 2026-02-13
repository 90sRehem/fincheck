import type { Meta, StoryObj } from "@storybook/react-vite";
import { CardSmall as CardRoot } from "@fincheck/design-system";
import type { CardSmallProps } from "@fincheck/design-system";
import { formatBRL } from "../utils";

type CardProps = {
  title: string;
  subtitle: string;
  value: number;
} & CardSmallProps;

function CardSmall({
  color = "gray",
  icon = "money",
  variant = "default",
  title,
  subtitle,
  value,
}: Readonly<CardProps>) {
  return (
    <div className="flex flex-col gap-4 items-center justify-center bg-teal-9 w-100 h-50 rounded-2xl">
      <CardRoot color={color} icon={icon} variant={variant}>
        <CardRoot.Content>
          <CardRoot.Header>
            <div className="flex flex-col items-start justify-center">
              <CardRoot.Label>{title}</CardRoot.Label>
              <CardRoot.Subtitle>{subtitle}</CardRoot.Subtitle>
            </div>
          </CardRoot.Header>
          <CardRoot.Balance>{formatBRL(value)}</CardRoot.Balance>
        </CardRoot.Content>
      </CardRoot>
    </div>
  );
}

const meta = {
  title: "Patterns/Card Small",
  component: CardSmall,
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
        "violet",
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
      options: [
        "food",
        "home",
        "education",
        "entertainment",
        "grocery",
        "clothing",
        "health",
        "transport",
        "trip",
        "revenue",
        "expense",
        "bankAccounts",
        "money",
        "investment",
        "transactions",
        "account",
      ],
      description: "Icon to display in the card",
      defaultValue: "account",
    },
    variant: {
      control: { type: "select" },
      options: ["default", "income", "expense"],
      description: "Variant to display",
      defaultValue: "default",
    },
  },
} satisfies Meta<typeof CardSmall>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    color: "green",
    icon: "food",
    variant: "expense",
    value: 100.32,
    title: "Conta Corrente",
    subtitle: "Saldo atual",
  },
};
