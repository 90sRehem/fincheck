import { tv } from "tailwind-variants";
import { icons, type IconName } from "./icons";

import {
  createContext,
  useContext,
  useMemo,
  type PropsWithChildren,
} from "react";
import { Amount } from "@/components/ui";
import { cn } from "@/lib/utils";

const card = tv({
  slots: {
    container:
      "bg-white flex flex-row items-start p-0 gap-2 min-h-51 h-full min-w-65 rounded-2xl shrink-0 border-b-4",
    content: "flex flex-col justify-between items-start p-4 gap-10",
    categoryAndNameContainer:
      "flex flex-col justify-center items-start p-0 gap-4",
    accountName: "body-normal-medium text-gray-8 text-center",
    balanceContainer: "flex flex-col items-start justify-end p-0 h-12",
    balanceDescription: "body-small-regular text-gray-6",
  },
  variants: {
    border: {
      gray: { container: "border-b-gray-6" },
      red: { container: "border-b-red-6" },
      pink: { container: "border-b-pink-6" },
      grape: { container: "border-b-grape-6" },
      purple: { container: "border-b-purple-6" },
      indigo: { container: "border-b-indigo-6" },
      blue: { container: "border-b-blue-6" },
      cyan: { container: "border-b-cyan-6" },
      teal: { container: "border-b-teal-6" },
      green: { container: "border-b-green-6" },
      lime: { container: "border-b-lime-6" },
      yellow: { container: "border-b-yellow-6" },
      orange: { container: "border-b-orange-6" },
    },
    variant: {
      empty: {
        container:
          "w-full min-h-51 h-full bg-transparent border-2 border-dashed border-gray-4 border-b-2 flex items-center justify-center cursor-pointer transition-all duration-200 hover:border-gray-5 hover:bg-teal-6 group",
        content: "flex flex-col items-center justify-center gap-4 p-4",
        categoryAndNameContainer: "flex flex-col items-center gap-4",
        accountName:
          "body-normal-medium text-white text-center group-hover:text-white transition-colors",
      },
    },
  },
});

type Colors =
  | "gray"
  | "red"
  | "pink"
  | "grape"
  | "purple"
  | "indigo"
  | "blue"
  | "cyan"
  | "teal"
  | "green"
  | "lime"
  | "yellow"
  | "orange";

const CardLargeContext = createContext<CardProps | null>(null);

function CardLargeProvider({
  children,
  color,
  icon,
  variant,
  hideAmount,
}: Readonly<PropsWithChildren<CardProps>>) {
  const value = useMemo(
    () => ({ color, icon, variant, hideAmount }),
    [color, icon, variant, hideAmount],
  );
  return (
    <CardLargeContext.Provider value={value}>
      {children}
    </CardLargeContext.Provider>
  );
}

export function useCardLarge() {
  const context = useContext(CardLargeContext);
  if (context === null) {
    throw new Error("useCardLarge must be used within a CardLargeProvider");
  }
  return context;
}

export type CardProps = {
  color?: Colors;
  icon?: "money" | "investment" | "account";
  className?: string;
  variant?: "empty";
  hideAmount?: boolean;
};

export function CardRoot({
  color,
  children,
  icon,
  className,
  variant,
  hideAmount = true,
}: Readonly<PropsWithChildren<CardProps>>) {
  const { container } = card({ variant });
  return (
    <CardLargeProvider
      hideAmount={hideAmount}
      color={color}
      icon={icon}
      variant={variant}
    >
      <div
        className={cn(container({ border: color }), className)}
        data-border={color}
      >
        {children}
      </div>
    </CardLargeProvider>
  );
}

function CardIcon() {
  const { icon } = useCardLarge();
  return <>{icons[icon ?? "money"]}</>;
}

type CardContentProps = React.ComponentProps<"div"> & { className?: string };

function CardContent({
  children,
  className,
}: Readonly<PropsWithChildren<CardContentProps>>) {
  const { variant } = useCardLarge();
  const styles = card({ variant });
  return <div className={cn(styles.content(), className)}>{children}</div>;
}

function CardHeader({ children }: Readonly<PropsWithChildren>) {
  const { variant } = useCardLarge();
  const styles = card({ variant });
  return (
    <div className={styles.categoryAndNameContainer()}>
      <CardIcon />
      {children}
    </div>
  );
}

function CardBalance({ children }: Readonly<PropsWithChildren>) {
  const styles = card();
  const { hideAmount } = useCardLarge();
  return (
    <div className={styles.balanceContainer()}>
      <Amount state={hideAmount ? "hide" : "show"} variant="default">
        {children}
      </Amount>
      <span className={styles.balanceDescription()}>Saldo atual</span>
    </div>
  );
}

function CardTitle({ children }: Readonly<PropsWithChildren>) {
  const { variant } = useCardLarge();
  const styles = card({ variant });
  return <span className={styles.accountName()}>{children}</span>;
}
type CardEmptyProps = {
  onClick?: () => void;
};

export const CardLarge = Object.assign(CardRoot, {
  Content: CardContent,
  Header: CardHeader,
  Balance: CardBalance,
  Title: CardTitle,
});
