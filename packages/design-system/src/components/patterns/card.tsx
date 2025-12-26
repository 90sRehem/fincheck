import { tv } from "tailwind-variants";
import { Icons } from "../ui";
import { Balance } from "./balance";

const card = tv({
  slots: {
    container:
      "bg-white flex flex-row items-start p-0 gap-2  w-65 rounded-2xl shrink-0 border-b-4",

    content: "flex flex-col justify-between items-start p-4 gap-10",
    categoryAndNameContainer:
      "flex flex-col justify-center items-start p-0 gap-4",
    accountName: "body-normal-medium text-gray-8",
    balanceContainer: "flex flex-col items-start justify-end p-0 h-12",
    balanceDescription: "body-small-regular text-gray-6",
  },
  variants: {
    border: {
      // violet: "",
      // green: "",
      // red: "",
      // orange: "",
      violet: { container: "border-b-violet-6" },
      green: { container: "border-b-green-6" },
      red: { container: "border-b-red-6" },
      orange: { container: "border-b-orange-6" },
    },
    size: {
      large: { container: "w-65 h-50 " },
      small: {
        container: "w-82 h-19 p-4 flex flex-row items-center border-none",
        content: "flex flex-row items-center p-0 gap-3",
        categoryAndNameContainer:
          "flex flex-row items-center justify-center p-0",
      },
    },
  },
  // compoundVariants: [
  //   {
  //     border: "violet",
  //     class: {
  //       container: "border-b-violet-6",
  //     },
  //   },
  //   {
  //     border: "green",
  //     class: {
  //       container: "border-b-green-6",
  //     },
  //   },
  //   {
  //     border: "red",
  //     class: {
  //       container: "border-b-red-6",
  //     },
  //   },
  //   {
  //     border: "orange",
  //     class: {
  //       container: "border-b-orange-6",
  //     },
  //   },
  // ],
});

const icons = {
  default: <Icons.CurrentAccount />,
  wallet: <Icons.Cash />,
  investment: <Icons.Investments />,
  new: <Icons.Plus />,
} as const;

function CardRoot({
  color = "orange",
  account = "wallet",
  size = "large",
}: Readonly<{
  color?: "violet" | "green" | "red" | "orange";
  account?: "default" | "wallet" | "investment" | "new";
  size?: "large" | "small";
}>) {
  const {
    container,
    content,
    categoryAndNameContainer,
    accountName,
    balanceContainer,
    balanceDescription,
  } = card();
  return (
    <div className={container({ border: color, size })} data-border={color}>
      <div className={content({ size })}>
        <div className={categoryAndNameContainer({ size })}>
          {icons[account]}
          {size === "large" && (
            <span className={accountName()}>Minha Conta</span>
          )}
        </div>

        {size === "small" && <span>04/06/2023</span>}
        <div className={balanceContainer()}>
          <Balance value={300.5} state="show" />
          {size === "large" && (
            <span className={balanceDescription()}>Saldo atual</span>
          )}
        </div>
      </div>
    </div>
  );
}

export const Card = Object.assign(CardRoot, {});
