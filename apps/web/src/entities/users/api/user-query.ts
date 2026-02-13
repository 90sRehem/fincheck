import { queryOptions } from "@tanstack/react-query";
import { getUser, type GetUserRequest } from "./get-user";

export const userQueryFactory = {
  all: ["user"] as const,
  getMe: ({ id }: GetUserRequest) =>
    queryOptions({
      queryKey: ["user", id],
      queryFn: () => getUser({ id }),
    }),
};
