import { useSuspenseQuery } from "@tanstack/react-query";
import { categoriesQueryFactory } from "../api/categories";

export function useCategoriesList() {
  const query = useSuspenseQuery(categoriesQueryFactory.list());

  return {
    categories: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
