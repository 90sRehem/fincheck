import { apiClient } from "@/shared/api";
import { queryOptions } from "@tanstack/react-query";

export type Color = {
  id: string;
  name: string;
};

async function listColors() {
  const response = await apiClient.get<Color[]>({
    url: "api/colors",
  });
  return { colors: response.data };
}

export const colorsQueryFactory = {
  all: ["colors"] as const,
  listColors: () =>
    queryOptions({
      queryKey: colorsQueryFactory.all,
      queryFn: listColors,
    }),
};
