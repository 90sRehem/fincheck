import type { Meta, StoryObj } from "@storybook/react-vite";
import { CurrencyInput } from "@fincheck/design-system";
import type { CurrencyInputProps } from "@fincheck/design-system";

const meta = {
  title: "UI/CurrencyInput",
  component: CurrencyInput,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    label: {
      control: { type: "text" },
      description: "Label exibido abaixo do input",
      defaultValue: "Saldo atual",
    },
    placeholder: {
      control: { type: "text" },
      description: "Placeholder do input",
      defaultValue: "R$ 0,00",
    },
    defaultValue: {
      control: { type: "text" },
      description: "Valor inicial do input",
    },
  },
} satisfies Meta<typeof CurrencyInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Saldo atual",
    placeholder: "R$ 0,00",
  },
};

export const WithValue: Story = {
  args: {
    label: "Saldo",
    defaultValue: "R$ 2.100,00",
  },
};

export const WithoutLabel: Story = {
  args: {
    placeholder: "R$ 0,00",
    label: undefined,
  },
};

export const CustomLabel: Story = {
  args: {
    label: "Valor da conta",
    placeholder: "R$ 0,00",
  },
};
