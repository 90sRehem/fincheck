import { apiClient } from "@/shared/api";

type BalanceEntry = {
	amountCents: number;
	currency: string;
};

export type GetBalanceResponse = {
	amountCents: number;
	currency: string;
};

export async function getBalance(): Promise<GetBalanceResponse> {
	const response = await apiClient.get<BalanceEntry[]>({
		url: "api/balances",
	});

	const entries = response.data;

	if (entries.length === 0) {
		return { amountCents: 0, currency: "BRL" };
	}

	const brlEntry = entries.find((e) => e.currency === "BRL");
	if (brlEntry) {
		return brlEntry;
	}

	return entries[0] ?? { amountCents: 0, currency: "BRL" };
}
