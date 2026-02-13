import { useSuspenseQuery } from "@tanstack/react-query";
import type { BalanceRequest } from "../api/get-balance";
import { formatBRLFromCents } from "@/shared/lib";
import { balanceQueryFactory } from "../api/balance-query-factory";

type UseBalanceProps = BalanceRequest;

export function useBalance({ userId }: UseBalanceProps) {
  const query = useSuspenseQuery(balanceQueryFactory.getBalance({ userId }));
  return {
    amount: formatBRLFromCents(query.data.amountCents, query.data.currency),
  };
}
