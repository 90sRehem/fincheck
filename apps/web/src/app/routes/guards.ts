import { redirect } from "@tanstack/react-router";
import { userIsAuthenticated } from "@/pages/session/model/session-store";

type BeforeLoadContext = {
  location: {
    href: string;
    pathname: string;
  };
};

export function authGuard({ location }: BeforeLoadContext) {
  const isAuthenticated = userIsAuthenticated();

  if (!isAuthenticated) {
    throw redirect({
      to: "/session/login",
      search: {
        redirect: location.href,
      },
    });
  }
}

export function guestGuard({ location }: BeforeLoadContext) {
  const isAuthenticated = userIsAuthenticated();

  if (isAuthenticated) {
    const searchParams = new URLSearchParams(location.href.split("?")[1]);
    const redirectTo = searchParams.get("redirect") || "/";

    throw redirect({
      to: redirectTo,
    });
  }
}
