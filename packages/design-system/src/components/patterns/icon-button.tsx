import { cn } from "@/lib/utils";
import { Button, Icons } from "../ui";

type IconButtonProps = {
  icon: keyof typeof Icons;
} & React.ComponentProps<typeof Button>;

export function IconButton({ icon, className, ...props }: IconButtonProps) {
  const IconComponent = Icons[icon];

  return (
    <button
      type="button"
      className={cn(
        "h-12 w-12 p-0 rounded-full bg-teal-9 flex items-center justify-center cursor-pointer transition-colors disabled:opacity-50 disabled:pointer-events-none",
        className,
      )}
      {...props}
    >
      <IconComponent className="size-6" />
    </button>
  );
}
