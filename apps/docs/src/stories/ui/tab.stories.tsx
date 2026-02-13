import type { Meta, StoryObj } from "@storybook/react-vite";
import { Tab as TabComponent } from "@fincheck/design-system";
import type { TabProps } from "@fincheck/design-system";

function Tab(props: TabProps) {
  return <TabComponent {...props} />;
}

const meta = {
  title: "UI/Tab",
  component: Tab,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Tab>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Default Tab",
  },
};

export const Multiple: Story = {
  render: () => (
    <div className="flex gap-2">
      <Tab>Tab 1</Tab>
      <Tab>Tab 2</Tab>
      <Tab>Tab 3</Tab>
    </div>
  ),
};

export const Active: Story = {
  render: () => <Tab active>Active Tab</Tab>,
};

export const Inactive: Story = {
  render: () => <Tab>Inactive Tab</Tab>,
};

export const TabGroup: Story = {
  render: () => (
    <div className="flex gap-2">
      <Tab active>Home</Tab>
      <Tab>Profile</Tab>
      <Tab>Settings</Tab>
      <Tab>Notifications</Tab>
    </div>
  ),
};

export const LongLabels: Story = {
  render: () => (
    <div className="flex gap-2">
      <TabComponent active>Dashboard Overview</TabComponent>
      <TabComponent>User Management</TabComponent>
      <TabComponent>System Configuration</TabComponent>
    </div>
  ),
};
