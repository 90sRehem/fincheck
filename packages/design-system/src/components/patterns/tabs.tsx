import {
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
} from "react";
import { Tab, type TabProps } from "../ui";
import { IconButton } from "./icon-button";
import { cn } from "@/lib/utils";

type TabsContextValue = {
  value?: string;
  onValueChange: (value: string) => void;
};

export type TabsProps = {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
} & Omit<React.ComponentProps<"div">, "children" | "className">;

export type TabsItemProps = {
  value: string;
  children: React.ReactNode;
  className?: string;
} & TabProps;

export type TabsButtonProps = {
  onClick?: () => void;
  className?: string;
} & Omit<React.ComponentProps<"button">, "onClick">;

export type TabsListProps = React.ComponentProps<"div">;

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error("Tabs2 compound components must be used within Tabs2");
  }
  return context;
}

function TabsProvider({
  children,
  value,
  defaultValue,
  onValueChange,
}: Readonly<{
  children: React.ReactNode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}>) {
  const [internalValue, setInternalValue] = useState<string | undefined>(
    defaultValue,
  );

  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  const handleValueChange = useCallback(
    (newValue: string) => {
      if (!isControlled) {
        setInternalValue(newValue);
      }
      onValueChange?.(newValue);
    },
    [isControlled, onValueChange],
  );

  const contextValue = useMemo(
    () => ({
      value: currentValue,
      onValueChange: handleValueChange,
    }),
    [currentValue, handleValueChange],
  );

  return (
    <TabsContext.Provider value={contextValue}>{children}</TabsContext.Provider>
  );
}

function Root({
  children,
  className,
  value,
  defaultValue,
  onValueChange,
  ...props
}: TabsProps) {
  return (
    <TabsProvider
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
    >
      <div
        className={cn("flex flex-row items-center w-full p-0 gap-4", className)}
        {...props}
      >
        {children}
      </div>
    </TabsProvider>
  );
}

function List({ className, children, ...props }: TabsListProps) {
  return (
    <div className={cn("flex flex-1 gap-2", className)} {...props}>
      {children}
    </div>
  );
}

function Item({ value, children, className, ...props }: TabsItemProps) {
  const { value: currentValue, onValueChange } = useTabsContext();

  const active = currentValue === value;
  const onClick = () => onValueChange(value);

  return (
    <Tab
      active={active}
      onClick={onClick}
      className={cn("flex-1", className)}
      {...props}
    >
      {children}
    </Tab>
  );
}

function PrevButton({ className, onClick, ...props }: TabsButtonProps) {
  return (
    <IconButton
      icon="ArrowLeft"
      className={cn("hover:bg-gray-1", className)}
      onClick={onClick}
      {...props}
    />
  );
}

function NextButton({ className, onClick, ...props }: TabsButtonProps) {
  return (
    <IconButton
      icon="ArrowRight"
      className={cn("hover:bg-gray-1", className)}
      onClick={onClick}
      {...props}
    />
  );
}

export const Tabs = Object.assign(Root, {
  List,
  Item,
  PrevButton,
  NextButton,
});
