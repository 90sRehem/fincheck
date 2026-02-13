import { tv } from "tailwind-variants";
import type { Colors } from "./model";
import { icons, type IconName } from "./icons";
import {
  createContext,
  useContext,
  useMemo,
  type PropsWithChildren,
} from "react";
import { Amount, type AmountProps } from "@/components/ui";

const card = tv({
  slots: {
    container:
      "bg-white h-20 min-w-[377px] flex items-center justify-between px-4 py-3 rounded-xl border-l-4 transition-colors cursor-pointer hover:bg-gray-1",
    content: "flex flex-row w-full justify-between items-center p-4 gap-10",
    header: "flex items-center gap-3",
    label: "body-normal-medium text-gray-8 text-center",
    subtitle: "body-small-regular text-gray-6",
    balanceContainer: "flex flex-col justify-center p-0",
  },
  variants: {
    border: {
      gray: { container: "border-l-gray-6" },
      red: { container: "border-l-red-6" },
      pink: { container: "border-l-pink-6" },
      grape: { container: "border-l-grape-6" },
      violet: { container: "border-l-violet-6" },
      indigo: { container: "border-l-indigo-6" },
      blue: { container: "border-l-blue-6" },
      cyan: { container: "border-l-cyan-6" },
      teal: { container: "border-l-teal-6" },
      green: { container: "border-l-green-6" },
      lime: { container: "border-l-lime-6" },
      yellow: { container: "border-l-yellow-6" },
      orange: { container: "border-l-orange-6" },
    },
  },
});

export type CardSmallProps = {
  color?: Colors;
  icon?: IconName;
  hideAmount?: boolean;
} & Pick<AmountProps, "variant">;

const CardSmallContext = createContext<CardSmallProps | null>(null);

function useCardSmall() {
  const context = useContext(CardSmallContext);
  if (!context) {
    throw new Error("useCardSmall must be used within a CardSmallProvider");
  }
  return context;
}

function CardSmallProvider({
  children,
  color,
  icon,
  variant,
  hideAmount,
}: Readonly<PropsWithChildren<CardSmallProps>>) {
  const value = useMemo(
    () => ({ color, icon, variant, hideAmount }),
    [color, icon, variant, hideAmount],
  );
  return (
    <CardSmallContext.Provider value={value}>
      {children}
    </CardSmallContext.Provider>
  );
}

export function CardRoot({
  color,
  children,
  icon,
  variant,
  hideAmount,
}: Readonly<PropsWithChildren<CardSmallProps>>) {
  const styles = card();
  return (
    <CardSmallProvider color={color} icon={icon} variant={variant} hideAmount={hideAmount}>
      <div className={styles.container({ border: color })} data-border={color}>
        {children}
      </div>
    </CardSmallProvider>
  );
}

function CardIcon() {
  const { icon } = useCardSmall();
  return <>{icons[icon ?? "money"]}</>;
}

function CardContent({ children }: Readonly<PropsWithChildren>) {
  const styles = card();
  return <div className={styles.content()}>{children}</div>;
}

function CardHeader({ children }: Readonly<PropsWithChildren>) {
  const styles = card();
  return (
    <div className={styles.header()}>
      <CardIcon />
      {children}
    </div>
  );
}

function CardLabel({ children }: Readonly<PropsWithChildren>) {
  const styles = card();
  return <span className={styles.label()}>{children}</span>;
}

function CardSubtitle({ children }: Readonly<PropsWithChildren>) {
  const styles = card();
  return <span className={styles.subtitle()}>{children}</span>;
}

function CardBalance({ children }: Readonly<PropsWithChildren>) {
  const styles = card();
  const { variant, hideAmount } = useCardSmall();
  return (
    <div className={styles.balanceContainer()}>
      <Amount state={hideAmount ? "hide" : "show"} variant={variant}>
        {children}
      </Amount>
    </div>
  );
}

export const CardSmall = Object.assign(CardRoot, {
  Content: CardContent,
  Header: CardHeader,
  Label: CardLabel,
  Subtitle: CardSubtitle,
  Balance: CardBalance,
  Icon: CardIcon,
});
