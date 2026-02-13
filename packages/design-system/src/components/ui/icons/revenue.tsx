import type { IconProps } from "./types";
import { CurrentAccountBase, MoneyBase, InvestmentsBase } from "./base";

export function CurrentAccount(props: Readonly<IconProps>) {
	return <CurrentAccountBase className="text-green-9" {...props} />;
}

export function Money(props: Readonly<IconProps>) {
	return <MoneyBase className="text-teal-6" {...props} />;
}

export function Investments(props: Readonly<IconProps>) {
	return <InvestmentsBase className="text-lime-6" {...props} />;
}
