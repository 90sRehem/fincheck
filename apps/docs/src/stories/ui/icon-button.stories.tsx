import type { Meta, StoryObj } from "@storybook/react-vite";
import { IconButton, Icons } from "@fincheck/design-system";
import type { IconButtonProps } from "@fincheck/design-system";

function IconButtonDemo({ icon, size, variant }: IconButtonProps) {
  return (
    <IconButton
      icon={icon}
      size={size}
      variant={variant}
      className="text-gray-0 bg-teal-9 hover:bg-teal-8"
    />
  );
}

const meta = {
  title: "UI/IconButton",
  component: IconButtonDemo,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    icon: { control: "select", options: Object.keys(Icons) },
    size: { control: "select", options: ["default", "sm"] },
    variant: { control: "select", options: ["default", "dashed"] },
  },
} satisfies Meta<typeof IconButtonDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    icon: "Plus",
    size: "default",
    variant: "default",
  },
};
