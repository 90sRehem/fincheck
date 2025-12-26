import { Button, Fab } from "@fincheck/design-system";
import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { useEffect, useState } from "react";
import { SplashScreen } from "../../shared/ui";
import { sessionRoutes } from "./session-routes";
import { HomePage } from "@/pages/home";
import { authGuard } from "./guards";

function RootLayout() {
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setShowSplash(false), 3500);
    return () => clearTimeout(timeout);
  }, []);

  return showSplash ? (
    <SplashScreen />
  ) : (
    <>
      <Outlet />
      <TanStackRouterDevtools />
    </>
  );
}

export const rootRoute = createRootRoute({
  component: RootLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  beforeLoad: authGuard,
  path: "/",
  component: () => <HomePage />,
});

export const routeTree = rootRoute.addChildren([indexRoute, sessionRoutes]);

export const router = createRouter({
  routeTree,
  defaultViewTransition: true,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
