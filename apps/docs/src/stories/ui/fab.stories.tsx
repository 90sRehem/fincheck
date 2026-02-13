import type { Meta, StoryObj } from "@storybook/react-vite";
import { Fab as FabComponent, IconButton } from "@fincheck/design-system";

function Fab() {
  return (
    <FabComponent>
      <FabComponent.Trigger asChild className="group">
        <IconButton
          icon="Plus"
          className="bg-teal-9 text-white [&[data-state=open]>svg]:rotate-45 [&>svg]:transition-transform [&>svg]:duration-300 [&>svg]:ease-in-out"
        />
      </FabComponent.Trigger>
      <FabComponent.Content
        side="top"
        align="end"
        sideOffset={16}
        className="bg-white flex flex-col justify-end items-start p-2 rounded-2xl"
      >
        <FabComponent.Item>
          <FabComponent.ItemIcon icon="Expense" />
          <FabComponent.ItemText>Nova Despesa</FabComponent.ItemText>
        </FabComponent.Item>
        <FabComponent.Item>
          <FabComponent.ItemIcon icon="Revenue" />
          <FabComponent.ItemText>Nova Receita</FabComponent.ItemText>
        </FabComponent.Item>
        <FabComponent.Item>
          <FabComponent.ItemIcon icon="BankAccounts" />
          <FabComponent.ItemText>Nova Conta</FabComponent.ItemText>
        </FabComponent.Item>
      </FabComponent.Content>
    </FabComponent>
  );
}

const meta = {
  title: "UI/Fab",
  component: Fab,
  tags: ["autodocs"],
} satisfies Meta<typeof Fab>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: "Componente Fab.",
      },
    },
  },
};
