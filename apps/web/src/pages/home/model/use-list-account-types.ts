import { useSuspenseQuery } from "@tanstack/react-query";
import { accountTypesQueryFactory } from "../api/account-types";

export function useListAccountTypes() {
  const query = useSuspenseQuery(accountTypesQueryFactory.listAccountTypes());

  return {
    accountTypes: query.data.accountTypes,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
