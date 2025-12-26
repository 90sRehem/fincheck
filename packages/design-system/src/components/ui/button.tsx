import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import * as React from "react";

export const button = cva(
  "inline-flex cursor-pointer items-center justify-center rounded font-medium transition-colors select-none h-12 px-6 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary: "",
        secondary: "border",
        tertiary: "px-4 h-auto",
      },

      intent: {
        default: "",
        destructive: "",
        ghost: "",
      },
    },

    compoundVariants: [
      {
        variant: "primary",
        intent: "default",
        class:
          "bg-teal-9 text-white hover:bg-teal-8 active:bg-teal-10 rounded-2xl",
      },
      {
        variant: "primary",
        intent: "destructive",
        class: "bg-red-9 text-white hover:bg-red-8 active:bg-red-10",
      },
      {
        variant: "primary",
        intent: "ghost",
        class: "bg-transparent text-teal-9 hover:bg-teal-2",
      },
      {
        variant: "secondary",
        intent: "default",
        class: "border-gray-4 text-gray-9 hover:bg-gray-2 active:bg-gray-3",
      },
      {
        variant: "secondary",
        intent: "destructive",
        class: "border-red-9 text-red-9 hover:bg-red-2 active:bg-red-3",
      },
      {
        variant: "secondary",
        intent: "ghost",
        class: "border-transparent text-gray-9 hover:bg-gray-2",
      },
      {
        variant: "tertiary",
        intent: "default",
        class: "text-teal-9 hover:underline",
      },
      {
        variant: "tertiary",
        intent: "destructive",
        class: "text-red-9 hover:underline",
      },
      {
        variant: "tertiary",
        intent: "ghost",
        class: "text-gray-9 hover:underline",
      },
    ],

    defaultVariants: {
      variant: "primary",
      intent: "default",
    },
  },
);

export type ButtonVariant = "primary" | "secondary" | "tertiary";
export type ButtonIntent = "default" | "destructive" | "ghost";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  intent?: ButtonIntent;
  asChild?: boolean;
}

export function Button({
  className,
  variant,
  intent,
  asChild = false,
  type = "button",
  ...props
}: Readonly<ButtonProps>) {
  const Comp = asChild ? Slot : "button";
  const buttonClassNames = cn(button({ variant, intent }), className);
  return <Comp type={type} className={buttonClassNames} {...props} />;
}
