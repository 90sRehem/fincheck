import type { ErrorInfo } from "react";
import { userStorage } from "../../storage";

type ErrorContext = {
  type?: "global" | "session" | "app-route" | "component";
  queryKey?: unknown[];
  userId?: string;
  errorInfo?: ErrorInfo;
};
export function reportError(error: Error, context?: ErrorContext) {
  const errorData = {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
    userId: userStorage.getUser()?.id,
    ...context,
  };
  console.error("Error reported:", errorData);

  // 🔹 Enviar para serviço de monitoramento (Sentry, etc.)
  // Sentry.captureException(error, { extra: errorData });

  try {
    const errors = JSON.parse(localStorage.getItem("app_errors") || "[]");
    errors.push(errorData);
    if (errors.length > 10) errors.shift();
    localStorage.setItem("app_errors", JSON.stringify(errors));
  } catch {
    // Ignorar falhas de localStorage
  }
}
