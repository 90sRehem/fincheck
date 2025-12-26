import { createRoute, Outlet, redirect } from "@tanstack/react-router";
import { rootRoute } from "./root-route";
import { SessionLayout, LoginPage, RegisterPage } from "@/pages/session";
import { guestGuard } from "./guards";

const sessionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/session",
  component: () => (
    <SessionLayout>
      <Outlet />
    </SessionLayout>
  ),
});

const sessionIndexRoute = createRoute({
  getParentRoute: () => sessionRoute,
  path: "/",
  beforeLoad: () => {
    throw redirect({ to: "/session/login" });
  },
});

const loginRoute = createRoute({
  getParentRoute: () => sessionRoute,
  path: "/login",
  beforeLoad: guestGuard,
  component: LoginPage,
});

const registerRoute = createRoute({
  getParentRoute: () => sessionRoute,
  path: "/register",
  beforeLoad: guestGuard,
  component: RegisterPage,
});

// const passwordResetRoute = createRoute({
//   getParentRoute: () => sessionRoute,
//   path: "/password-reset",
//   beforeLoad: (opts) => guestGuard(opts),
//   component: () => <div>Password Reset Page</div>,
// });
//
// const forgotPasswordRoute = createRoute({
//   getParentRoute: () => sessionRoute,
//   path: "/forgot-password",
//   beforeLoad: (opts) => guestGuard(opts),
//   component: () => <div>Forgot Password Page</div>,
// });
//
export const sessionRoutes = sessionRoute.addChildren([
  sessionIndexRoute,
  loginRoute,
  registerRoute,
  // passwordResetRoute,
  // forgotPasswordRoute,
]);
