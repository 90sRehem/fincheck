import { useSuspenseQuery } from "@tanstack/react-query";
import { accountsQueryFactory } from "../api/accounts";

export function useListAccounts() {
	const query = useSuspenseQuery(accountsQueryFactory.listAccounts());

	return {
		accounts: query.data,
		isLoading: query.isLoading,
		isError: query.isError,
	};
}
