import { useSuspenseQuery } from "@tanstack/react-query";
import { colorsQueryFactory } from "../api/colors";

export function useListColors() {
  const query = useSuspenseQuery(colorsQueryFactory.listColors());

  return {
    colors: query.data.colors,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
