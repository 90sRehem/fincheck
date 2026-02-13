import { DropdownMenu } from "../ui";
import { Icons } from "../ui/icons/icons.tsx";
import { tv } from "tailwind-variants";
import { cn } from "@/lib/utils";
import {
  type ComponentProps,
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";

const pillVariants = tv({
  slots: {
    trigger:
      "group flex flex-row items-center justify-center gap-2 p-3 h-12 rounded-[48px] text-gray-9 data-[state=open]:text-gray-11 hover:cursor-pointer hover:bg-gray-2",
    triggerIcon:
      "size-6 transition-all duration-300 ease-in-out group-data-[state=open]:rotate-180",
    icon: "size-6 transition-all duration-300 ease-in-out",
    content:
      "w-69.75 h-44 bg-white flex flex-col justify-center items-start p-2 gap-2 rounded-2xl border-gray-1 shadow-2xs text-right",
    item: "rounded-2xl hover:cursor-pointer hover:bg-gray-2",
  },
});

type PillContextValue = {
  selectedValue?: string;
  onValueChange?: (value: string) => void;
};

const PillContext = createContext<PillContextValue>({});

const usePillContext = () => useContext(PillContext);

export interface PillProps extends Omit<ComponentProps<"div">, "defaultValue"> {
  value?: string;
  onValueChange?: (value: string) => void;
  defaultValue?: string;
}

function Root({
  children,
  className = "",
  value: controlledValue,
  onValueChange,
  defaultValue,
  ...props
}: Readonly<PillProps>) {
  const [internalValue, setInternalValue] = useState(defaultValue);

  const isControlled = controlledValue !== undefined;
  const selectedValue = isControlled ? controlledValue : internalValue;

  const handleValueChange = (newValue: string) => {
    if (!isControlled) {
      setInternalValue(newValue);
    }
    onValueChange?.(newValue);
  };

  const contextValue = useMemo(
    () => ({
      selectedValue,
      onValueChange: handleValueChange,
    }),
    [],
  );

  return (
    <PillContext.Provider value={contextValue}>
      <div className={cn(className)} {...props}>
        <DropdownMenu>{children}</DropdownMenu>
      </div>
    </PillContext.Provider>
  );
}

export type PillTriggerProps = ComponentProps<typeof DropdownMenu.Trigger> & {
  showArrow?: boolean;
};

function PillTrigger({
  children,
  className = "",
  showArrow = true,
  ...props
}: Readonly<PillTriggerProps>) {
  const styles = pillVariants();

  return (
    <DropdownMenu.Trigger
      className={cn(styles.trigger(), className)}
      {...props}
    >
      {children}
      {showArrow && <Icons.ArrowDown className={styles.triggerIcon()} />}
    </DropdownMenu.Trigger>
  );
}

export type PillContentProps = ComponentProps<typeof DropdownMenu.Content>;

function PillContent({
  children,
  className = "",
  ...props
}: Readonly<PillContentProps>) {
  const styles = pillVariants();

  return (
    <DropdownMenu.Content
      className={cn(styles.content(), className)}
      {...props}
    >
      {children}
    </DropdownMenu.Content>
  );
}

export type PillItemProps = ComponentProps<typeof DropdownMenu.Item> & {
  value: string;
};

function PillItem({
  children,
  className = "",
  value,
  onClick = undefined,
  ...props
}: Readonly<PillItemProps>) {
  const styles = pillVariants();
  const { onValueChange } = usePillContext();

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    onValueChange?.(value);
    onClick?.(e);
  };

  return (
    <DropdownMenu.Item
      className={cn(styles.item(), className)}
      onClick={handleClick}
      {...props}
    >
      {children}
    </DropdownMenu.Item>
  );
}

function PillItemText({
  children,
  className = "",
}: Readonly<{
  children: React.ReactNode;
  className?: string;
}>) {
  return (
    <span className={cn("body-small-regular text-gray-8", className)}>
      {children}
    </span>
  );
}

export const Pill = Object.assign(Root, {
  Trigger: PillTrigger,
  Content: PillContent,
  Item: PillItem,
  ItemText: PillItemText,
});
