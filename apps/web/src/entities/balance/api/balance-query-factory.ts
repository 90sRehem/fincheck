import { queryOptions } from "@tanstack/react-query";
import { getBalance } from "./get-balance";
import type { BalanceRequest } from "./get-balance";

export const balanceQueryFactory = {
  all: ["balance"] as const,
  getBalance: ({ userId }: BalanceRequest) =>
    queryOptions({
      queryKey: ["balance", userId],
      queryFn: async () => getBalance({ userId }),
    }),
};
