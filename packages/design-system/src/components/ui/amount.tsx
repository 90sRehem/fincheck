import { cn } from "@/lib/utils";
import type { PropsWithChildren } from "react";
import { tv } from "tailwind-variants";

export const amount = tv({
  base: "text-right body-normal-medium transition-all duration-300 data-[state=hide]:blur-sm",
  variants: {
    state: {
      hide: "data-[state=hide]:blur-sm",
      show: "data-[state=show]",
    },
    variant: {
      revenue: "text-green-8",
      expense: "text-red-8",
      default: "text-gray-8",
    },
  },
});

export type AmountProps = {
  variant?: "revenue" | "expense" | "default";
  state?: "show" | "hide";
  className?: string;
};

export function Amount({
  className,
  state = "hide",
  variant = "default",
  children,
}: Readonly<PropsWithChildren<AmountProps>>) {
  const prefix = {
    revenue: "+",
    expense: "-",
    default: "",
  };
  const prefixValue = prefix[variant] ?? prefix.default;
  return (
    <span
      className={cn(amount({ state, variant }), className)}
      data-state={state}
    >
      {prefixValue}
      {children}
    </span>
  );
}
