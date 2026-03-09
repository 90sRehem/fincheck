import type { CardProps, Colors, IconName } from "@fincheck/design-system";
import { CardLarge, IconButton } from "@fincheck/design-system";
import { Link } from "@tanstack/react-router";
import { useUser } from "@/entities/users";
import { formatBRLFromCents } from "@/shared/lib";
import { useBalanceVisibility } from "../model/balance-visibility-store";
import { useListAccounts } from "../model/use-list-accounts";

type AccountIconName = "money" | "investment" | "account";

const accountTypeToIcon: Record<string, AccountIconName> = {
	bank_account: "account",
	wallet: "money",
	credit_card: "account",
	investment: "investment",
};

export function AccountsList() {
	const { user } = useUser();
	const { accounts } = useListAccounts({ userId: user.id });
	const hideAmount = useBalanceVisibility();

	return (
		<div className="flex flex-col justify-center items-start gap-4 w-full h-full 2xl:h-auto">
			<h4 className="heading-4 text-white">Minhas Contas</h4>
			<div className="flex flex-row items-start gap-4 w-full h-full overflow-x-scroll overflow-y-hidden scrollbar-hide">
				{accounts.length > 0 ? (
					accounts.map((account) => (
						<CardLarge
							key={account.id}
							color={account.color as Colors}
							icon={accountTypeToIcon[account.type] ?? "money"}
							hideAmount={hideAmount}
						>
							<CardLarge.Content>
								<CardLarge.Header>{account.name}</CardLarge.Header>
								<CardLarge.Balance>
									{formatBRLFromCents(account.amount, "BRL")}
								</CardLarge.Balance>
							</CardLarge.Content>
						</CardLarge>
					))
				) : (
					<CardLarge variant="empty">
						<Link to="/add-account">
							<CardLarge.Content>
								<IconButton
									icon="Plus"
									size="sm"
									variant="dashed"
									className="text-white transition-colors"
								/>
								<CardLarge.Title>
									Cadastre uma <br /> nova conta
								</CardLarge.Title>
							</CardLarge.Content>
						</Link>
					</CardLarge>
				)}
			</div>
		</div>
	);
}
