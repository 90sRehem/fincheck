import { apiClient } from "@/shared/api";
import { queryOptions } from "@tanstack/react-query";

export type Category = {
  id: string;
  name: string;
};

async function listCategories() {
  const response = await apiClient.get<Category[]>({
    url: "/categories",
  });
  return response.data;
}

export const categoriesQueryFactory = {
  all: ["categories"],
  list: () =>
    queryOptions({
      queryKey: categoriesQueryFactory.all,
      queryFn: listCategories,
    }),
};
