import type { Meta, StoryObj } from "@storybook/react-vite";
import { Tabs as TabsComponent } from "@fincheck/design-system";

function Tabs() {
  return (
    <div className="flex items-center justify-center bg-gray-1 h-40 rounded">
      <TabsComponent>
        <TabsComponent.PrevButton />
        <TabsComponent.List>
          <TabsComponent.Item value="tab-1">Tab 1</TabsComponent.Item>
          <TabsComponent.Item value="tab-2">Tab 2</TabsComponent.Item>
          <TabsComponent.Item value="tab-3">Tab 3</TabsComponent.Item>
        </TabsComponent.List>
        <TabsComponent.NextButton />
      </TabsComponent>
    </div>
  );
}

const meta = {
  title: "Patterns/Tabs",
  component: Tabs,

  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {},
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: "Componente tabs. Use as setas para navegar entre os tabs.",
      },
    },
  },
};
