import type { Meta, StoryObj } from "@storybook/react-vite";
import { Avatar } from "@fincheck/design-system";

interface AvatarStoryProps {
  src?: string;
  alt?: string;
  fallback: string;
}

function AvatarDemo({ src, alt, fallback }: AvatarStoryProps) {
  return (
    <Avatar>
      {src && <Avatar.Image src={src} alt={alt || "Avatar"} />}
      <Avatar.Fallback>{fallback}</Avatar.Fallback>
    </Avatar>
  );
}

const meta = {
  title: "UI/Avatar",
  component: AvatarDemo,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    src: { control: "text" },
    alt: { control: "text" },
    fallback: { control: "text" },
  },
} satisfies Meta<typeof AvatarDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    fallback: "RH",
  },
};

export const WithImage: Story = {
  args: {
    src: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80",
    alt: "User avatar",
    fallback: "RH",
  },
};

