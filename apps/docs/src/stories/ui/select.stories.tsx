import type { Meta, StoryObj } from "@storybook/react-vite";
import { Select as SelectComponent } from "@fincheck/design-system";

function Select() {
  return (
    <div className="flex items-center justify-center bg-gray-1 h-40 rounded">
      <SelectComponent>
        <SelectComponent.Trigger>
          <SelectComponent.Value placeholder="Selecione" />
        </SelectComponent.Trigger>
        <SelectComponent.Content>
          <SelectComponent.Group>
            <SelectComponent.Item value="item-1">Item 1</SelectComponent.Item>
            <SelectComponent.Item value="item-2">Item 2</SelectComponent.Item>
            <SelectComponent.Item value="item-3">Item 3</SelectComponent.Item>
          </SelectComponent.Group>
        </SelectComponent.Content>
      </SelectComponent>
    </div>
  );
}

const meta = {
  title: "UI/Select",
  component: Select,
  tags: ["autodocs"],
  argTypes: {},
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: "Componente Select. Utilizado para seleção de opções.",
      },
    },
  },
};
