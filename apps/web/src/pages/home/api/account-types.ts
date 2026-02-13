import { apiClient } from "@/shared/api";
import { queryOptions } from "@tanstack/react-query";

export type AccountType = {
  id: string;
  name: string;
};

async function listAccountTypes() {
  const response = await apiClient.get<AccountType[]>({
    url: "api/account_types",
  });
  return { accountTypes: response.data };
}

export const accountTypesQueryFactory = {
  all: ["account-types"] as const,
  listAccountTypes: () =>
    queryOptions({
      queryKey: accountTypesQueryFactory.all,
      queryFn: listAccountTypes,
    }),
};
