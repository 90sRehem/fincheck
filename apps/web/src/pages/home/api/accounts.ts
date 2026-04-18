import { queryOptions } from "@tanstack/react-query";
import { apiClient } from "@/shared/api";

export type CreateAccountRequest = {
	name: string;
	accountTypeId: string;
	colorId: string;
	initialBalance: number;
	currencyId?: string;
	icon?: string | null;
};

export async function createAccount(data: CreateAccountRequest) {
	const response = await apiClient.post({
		url: "/bank-accounts",
		body: data,
	});
	return response.data;
}

export interface ColorData {
	id: string;
	name: string;
	hex: string;
}

export interface AccountTypeData {
	id: string;
	name: string;
}

export interface CurrencyData {
	id: string;
	code: string;
	name: string;
}

export type Account = {
	id: string;
	name: string;
	accountType: AccountTypeData;
	color: ColorData;
	initialBalance: number;
	currency: CurrencyData;
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
