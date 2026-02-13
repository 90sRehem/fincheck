import { DropdownMenu, General } from "../ui";
import { type ComponentProps } from "react";
import { cn } from "@/lib/utils.ts";

export interface FabProps extends ComponentProps<"div"> {}

export function Root({ children, className, ...props }: Readonly<FabProps>) {
  return (
    <div className={cn(className)} {...props}>
      <DropdownMenu>{children}</DropdownMenu>
    </div>
  );
}

const Icons = {
  Expense: General.Expense,
  Revenue: General.Revenue,
  BankAccounts: General.BankAccounts,
};

export type FabContentProps = ComponentProps<typeof DropdownMenu.Content>;

function FabContent({ className, ...props }: Readonly<FabContentProps>) {
  return (
    <DropdownMenu.Content
      side="top"
      align="end"
      sideOffset={16}
      className={cn(
        "bg-white flex flex-col justify-end items-start p-2 rounded-2xl",
        className,
      )}
      {...props}
    />
  );
}

export type FabTriggerProps = ComponentProps<typeof DropdownMenu.Trigger>;

function FabTrigger({ className, ...props }: Readonly<FabTriggerProps>) {
  return <DropdownMenu.Trigger className={cn(className)} {...props} />;
}

export type FabItemProps = {
  children: React.ReactNode;
  className?: string;
};

function FabItem({ children, className = "" }: Readonly<FabItemProps>) {
  return (
    <DropdownMenu.Item
      className={cn(
        "flex flex-row justify-start items-center p-2 gap-2 w-full h-16 bg-white rounded-2xl hover:cursor-pointer",
        className,
      )}
    >
      {children}
    </DropdownMenu.Item>
  );
}

function FabItemText({ children }: { children: React.ReactNode }) {
  return <span className="body-small-regular text-gray-8">{children}</span>;
}

function FabItemIcon({ icon }: { icon: keyof typeof Icons }) {
  const IconComponent = Icons[icon];
  return <IconComponent />;
}
export const Fab = Object.assign(Root, {
  Item: FabItem,
  ItemText: FabItemText,
  ItemIcon: FabItemIcon,
  Trigger: FabTrigger,
  Content: FabContent,
});
