import { queryOptions } from "@tanstack/react-query";
import { apiClient } from "@/shared/api";

export type AccountType = {
	id: string;
	name: string;
};

async function listAccountTypes() {
	const response = await apiClient.get<AccountType[]>({
		url: "/account_types",
	});
	return { accountTypes: response.data };
}

export const accountTypesQueryFactory = {
	all: ["account-types"] as const,
	listAccountTypes: () =>
		queryOptions({
			queryKey: accountTypesQueryFactory.all,
			queryFn: listAccountTypes,
		}),
};
