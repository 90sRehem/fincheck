import { tv } from "tailwind-variants";
import { Icons } from "../ui";

const iconButton = tv({
  base: "p-0 rounded-full flex items-center justify-center cursor-pointer transition-colors disabled:opacity-50 disabled:pointer-events-none",
  variants: {
    size: {
      default: "h-12 w-12",
      sm: "h-11 w-11",
    },
    variant: {
      default: "",
      dashed: "bg-transparent border-2 border-dashed border-gray-4",
    },
  },
  defaultVariants: {
    size: "default",
    variant: "default",
  },
});

export type IconButtonProps = {
  icon: keyof typeof Icons;
  size?: "default" | "sm";
  variant?: "default" | "dashed";
  className?: string;
} & React.ComponentProps<"button">;

export function IconButton({
  icon,
  size = "default",
  variant = "default",
  className = "",
  ...props
}: IconButtonProps) {
  const IconComponent = Icons[icon];

  return (
    <button
      type="button"
      className={iconButton({ size, variant, className })}
      {...props}
    >
      <IconComponent className="size-6" />
    </button>
  );
}
