import {
  transactionsQueryFactory,
  type GetTransactionRequest,
} from "./transactions";
import { useSuspenseQuery } from "@tanstack/react-query";

export function useTransaction({ id }: GetTransactionRequest) {
  const query = useSuspenseQuery(
    transactionsQueryFactory.getTransaction({ id }),
  );
  const transaction = {
    ...query.data,
    amountCents: query.data?.amountCents / 100,
  };

  return {
    transaction,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}
