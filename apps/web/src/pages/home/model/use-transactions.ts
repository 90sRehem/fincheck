import { useInfiniteQuery } from "@tanstack/react-query";
import { transactionsQueryFactory } from "../api/transactions";
import { useUser } from "@/entities/users";
import { transactionsFiltersStore } from "./transactions-filters-store";

export function useTransactions() {
  const { user } = useUser();
  const filters = transactionsFiltersStore.useSelector((state) => state);

  const query = useInfiniteQuery(
    transactionsQueryFactory.list({
      userId: user.id,
      accountId: filters.accountId,
      year: filters.year,
      month: filters.month,
      type: filters.type,
    }),
  );

  const allTransactions = query.data?.pages.flatMap((page) => page.data) ?? [];

  return {
    transactions: allTransactions,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    fetchNextPage: query.fetchNextPage,
  };
}
