import { apiClient } from "@/shared/api";

type BalanceResponse = {
  id: string;
  userId: string;
  amountCents: number;
  currency: string;
};

export type BalanceRequest = {
  userId: string;
};

type GetBalanceResponse = {
  amountCents: number;
  currency: string;
};

export async function getBalance({
  userId,
}: BalanceRequest): Promise<GetBalanceResponse> {
  const response = await apiClient.get<BalanceResponse>({
    url: `api/balances/${userId}`,
  });
  const result = response.data;
  return {
    amountCents: result.amountCents,
    currency: result.currency,
  };
}
