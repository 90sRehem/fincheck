import { useSuspenseQuery } from "@tanstack/react-query";
import { userQueryFactory } from "../api/user-query";

export function useUser() {
	const { data: user } = useSuspenseQuery(userQueryFactory.getMe());

	return {
		user,
	};
}
