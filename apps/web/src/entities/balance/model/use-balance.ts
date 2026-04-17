import { useSuspenseQuery } from "@tanstack/react-query";
import { formatBRLFromCents } from "@/shared/lib";
import { balanceQueryFactory } from "../api/balance-query-factory";

export function useBalance() {
	const query = useSuspenseQuery(balanceQueryFactory.getBalance());
	return {
		amount: formatBRLFromCents(query.data.amountCents, query.data.currency),
	};
}
