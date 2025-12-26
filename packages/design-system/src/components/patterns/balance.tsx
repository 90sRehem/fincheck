import { tv } from "tailwind-variants";

export const balance = tv({
  base: "text-right body-normal-medium transition-all duration-300 data-[state=hide]:blur-sm",
  variants: {
    state: {
      hide: "data-[state=hide]:blur-sm",
      show: "data-[state=show]",
    },
    type: {
      income: "text-green-8",
      expense: "text-red-8",
      default: "text-gray-8",
    },
  },
});

const formatBRL = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(value);
};

export function Balance({
  value,
  type = "default",
  state = "hide",
}: Readonly<{
  value: number;
  type?: "income" | "expense" | "default";
  state?: "show" | "hide";
}>) {
  const types = {
    income: "+",
    expense: "-",
    default: "",
  };
  const typeValue = types[type] ?? types.default;
  return (
    <span className={balance({ state: state, type })} data-state={state}>
      {typeValue} {formatBRL(value)}
    </span>
  );
}
