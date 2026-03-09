import { apiClient } from "@/shared/api";
import { queryOptions } from "@tanstack/react-query";

export type CreateAccountRequest = {
	name: string;
	type: string;
	color: string;
	amount: number;
	userId: string;
};

export async function createAccount({
	name,
	type,
	color,
	amount,
	userId,
}: CreateAccountRequest) {
	const response = await apiClient.post({
		url: "api/accounts",
		body: {
			name,
			type,
			color,
			amount,
			userId,
		},
	});
	return response.data;
}

type Colors = "gray" | "red" | "pink" | "grape" | "violet" | "indigo" | "blue";
type AccountType = "bank_account" | "wallet" | "credit_card" | "investment";

type Account = {
	id: string;
	name: string;
	type: AccountType;
	color: Colors;
	amount: number;
	userId: string;
};

export type ListAccountsRequest = {
	userId: string;
};
type ListAccountsResponse = Account[];

async function listAccounts({ userId }: ListAccountsRequest) {
	const response = await apiClient.get<ListAccountsResponse>({
		url: `api/accounts?userId=${userId}`,
	});
	return response.data;
}

export const accountsQueryFactory = {
	all: ["accounts"] as const,
	listAccounts: ({ userId }: ListAccountsRequest) =>
		queryOptions({
			queryKey: [...accountsQueryFactory.all, userId],
			queryFn: () => listAccounts({ userId }),
		}),
};
