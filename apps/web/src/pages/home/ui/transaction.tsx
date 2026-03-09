import { CardSmall, type IconName } from "@fincheck/design-system";
import { formatDateToBR, formatToBRLCurrency } from "@/shared/lib";
import type { Transaction as TransactionType } from "../api/transactions";
import { getCategoryMapping } from "../lib/category-mapping";
import { useBalanceVisibility } from "../model/balance-visibility-store";

type TransactionProps = {
	transaction: TransactionType;
};

export function Transaction({ transaction }: Readonly<TransactionProps>) {
	const hideAmount = useBalanceVisibility();

	const mapping = getCategoryMapping(transaction.category);

	return (
		<CardSmall
			icon={mapping.icon as IconName}
			color={transaction.color || mapping.color}
			variant={transaction.type}
			hideAmount={hideAmount}
		>
			<CardSmall.Content>
				<CardSmall.Header>
					<div className="flex flex-col items-start justify-center">
						<CardSmall.Label>{transaction.title}</CardSmall.Label>
						<CardSmall.Subtitle>
							{formatDateToBR(transaction.date)}
						</CardSmall.Subtitle>
					</div>
				</CardSmall.Header>
				<div className="flex flex-col items-center justify-center">
					<CardSmall.Balance>
						{formatToBRLCurrency(transaction.amountCents / 100)}
					</CardSmall.Balance>
				</div>
			</CardSmall.Content>
		</CardSmall>
	);
}
