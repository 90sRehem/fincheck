import { queryOptions } from "@tanstack/react-query";
import { getUser } from "./get-user";

export const userQueryFactory = {
	all: ["user"] as const,
	getMe: () =>
		queryOptions({
			queryKey: ["user", "me"],
			queryFn: () => getUser(),
		}),
};
