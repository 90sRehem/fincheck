import { queryOptions } from "@tanstack/react-query";
import { getBalance } from "./get-balance";

export const balanceQueryFactory = {
	all: ["balance"] as const,
	getBalance: () =>
		queryOptions({
			queryKey: ["balance"],
			queryFn: async () => getBalance(),
		}),
};
