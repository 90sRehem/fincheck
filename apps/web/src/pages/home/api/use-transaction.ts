import { useSuspenseQuery } from "@tanstack/react-query";
import {
	type GetTransactionRequest,
	transactionsQueryFactory,
} from "./transactions";

export function useTransaction({ id }: GetTransactionRequest) {
	const query = useSuspenseQuery(
		transactionsQueryFactory.getTransaction({ id }),
	);
	const transaction = {
		...query.data,
		amountCents: query.data?.amountCents ?? 0 / 100,
	};

	return {
		transaction,
		isLoading: query.isLoading,
		isError: query.isError,
		error: query.error,
	};
}
