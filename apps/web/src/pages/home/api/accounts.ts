import { queryOptions } from "@tanstack/react-query";
import { apiClient } from "@/shared/api";

export type CreateAccountRequest = {
	name: string;
	type: string;
	color: string;
	initialBalance: number;
	currency?: string;
	icon?: string | null;
};

export async function createAccount(data: CreateAccountRequest) {
	const response = await apiClient.post({
		url: "/bank-accounts",
		body: data,
	});
	return response.data;
}

export type Account = {
	id: string;
	name: string;
	type: "checking" | "savings" | "credit_card" | "cash" | "investment";
	color: string;
	initialBalance: number;
	currency: string;
	icon: string | null;
	createdAt: string;
	updatedAt: string;
};

type ListAccountsResponse = Account[];

async function listAccounts() {
	const response = await apiClient.get<ListAccountsResponse>({
		url: "/bank-accounts",
	});
	return response.data;
}

export const accountsQueryFactory = {
	all: ["accounts"] as const,
	listAccounts: () =>
		queryOptions({
			queryKey: [...accountsQueryFactory.all],
			queryFn: () => listAccounts(),
		}),
};
