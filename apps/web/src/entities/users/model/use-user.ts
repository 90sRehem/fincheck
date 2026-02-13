import { useSuspenseQuery } from "@tanstack/react-query";
import { userStore } from "./user";
import { userQueryFactory } from "../api/user-query";

export function useUser() {
  const userId = userStore.getState().user?.id;
  const { data: user } = useSuspenseQuery(
    userQueryFactory.getMe({ id: String(userId) }),
  );

  return {
    user,
  };
}
