import { Button } from "@fincheck/design-system";
import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";
import { reportError } from "../lib/core/error/error-reporter";

type GlobalErrorBoundaryProps = {
  children: React.ReactNode;
};

export function GlobalErrorBoundary({
  children,
}: Readonly<GlobalErrorBoundaryProps>) {
  return (
    <ErrorBoundary
      FallbackComponent={GlobalErrorFallback}
      onError={(error, errorInfo) => {
        // 🔹 Log crítico
        console.error("Global Error:", error, errorInfo);
        reportError(error, { type: "global", errorInfo });
      }}
    >
      <QueryErrorResetBoundary>
        {({ reset }) => (
          <ErrorBoundary
            onReset={reset}
            FallbackComponent={GlobalErrorFallback}
          >
            {children}
          </ErrorBoundary>
        )}
      </QueryErrorResetBoundary>
    </ErrorBoundary>
  );
}

type FallbackProps = {
  error: Error;
  resetErrorBoundary: () => void;
};

function GlobalErrorFallback({
  error,
  resetErrorBoundary,
}: Readonly<FallbackProps>) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-0">
      <div className="text-center p-8 max-w-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Oops! Algo deu errado
        </h1>
        <p className="text-gray-600 mb-6">
          Ocorreu um erro inesperado. Nossa equipe foi notificada.
        </p>
        <div className="space-y-4">
          <Button onClick={resetErrorBoundary}>Tentar Novamente</Button>
          <Button
            variant="tertiary"
            onClick={() => (globalThis.location.href = "/session/login")}
          >
            Fazer Login Novamente
          </Button>
        </div>
      </div>
    </div>
  );
}
