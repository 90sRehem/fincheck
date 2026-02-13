import { useSuspenseQuery } from "@tanstack/react-query";
import {
  accountsQueryFactory,
  type ListAccountsRequest,
} from "../api/accounts";

export function useListAccounts({ userId }: ListAccountsRequest) {
  const query = useSuspenseQuery(accountsQueryFactory.listAccounts({ userId }));

  return {
    accounts: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
