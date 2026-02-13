import {
  createRootRouteWithContext,
  createRoute,
  createRouter,
  Outlet,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { useEffect, useState } from "react";
import { SplashScreen } from "../../shared/ui";
import { sessionRoutes } from "./session-routes";
import { HomePage } from "@/pages/home";
import { Filters } from "@/pages/home/ui/filters";
import { AddExpense } from "@/pages/home/ui/add-expense";
import { AddRevenue } from "@/pages/home/ui/add-revenue";
import { AddAccount } from "@/pages/home/ui/add-accounts";
import { authGuard } from "./guards";
import type { QueryClient } from "@tanstack/react-query";
import { queryClient } from "@/shared/lib/react-query";
import { UpdateTransaction } from "@/pages/home/ui/update-transaction";
import { RemoveTransaction } from "@/pages/home/ui/remove-transaction";

type RouteContext = {
  queryClient: QueryClient;
};

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

export const rootRoute = createRootRouteWithContext<RouteContext>()({
  component: RootLayout,
});

type HomeSearchParams = {
  accountId?: string;
  year?: number;
  month?: number;
  type?: "transactions" | "expense" | "revenue";
};

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  beforeLoad: authGuard,
  path: "/",
  component: HomePage,
  validateSearch: (search: Record<string, unknown>): HomeSearchParams => {
    return {
      accountId: search.accountId as string | undefined,
      year: search.year ? Number(search.year) : undefined,
      month: search.month ? Number(search.month) : undefined,
      type: (search.type as HomeSearchParams["type"]) || undefined,
    };
  },
});

const filtersRoute = createRoute({
  getParentRoute: () => indexRoute,
  path: "filters",
  component: Filters,
});

const createExpenseRoute = createRoute({
  getParentRoute: () => indexRoute,
  path: "add-expense",
  component: AddExpense,
});

const createRevenueRoute = createRoute({
  getParentRoute: () => indexRoute,
  path: "add-revenue",
  component: AddRevenue,
});

const createAccountRoute = createRoute({
  getParentRoute: () => indexRoute,
  path: "add-account",
  component: AddAccount,
});

const updateTransactionRoute = createRoute({
  getParentRoute: () => indexRoute,
  path: "/$id",
  component: UpdateTransaction,
});

const removeTransactionRoute = createRoute({
  getParentRoute: () => indexRoute,
  path: "/remove/$id",
  component: RemoveTransaction,
});

const homeRouteTree = indexRoute.addChildren([
  filtersRoute,
  createExpenseRoute,
  createRevenueRoute,
  createAccountRoute,
  updateTransactionRoute,
  removeTransactionRoute,
]);

export const routeTree = rootRoute.addChildren([homeRouteTree, sessionRoutes]);

export const router = createRouter({
  routeTree,
  defaultViewTransition: true,
  context: {
    queryClient,
  },
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
