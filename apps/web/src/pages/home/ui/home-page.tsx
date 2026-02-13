import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";
import { Home } from "./home";
import { sessionActions } from "@/entities/session";

export function HomePageErrorFallback({ _error, resetErrorBoundary }: any) {
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
          <button onClick={resetErrorBoundary}>Tentar Novamente</button>
          <button
            onClick={() => {
              sessionActions.logout();
            }}
          >
            Fazer Login Novamente
          </button>
        </div>
      </div>
    </div>
  );
}

export function HomePage() {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          FallbackComponent={HomePageErrorFallback}
        >
          <Home />
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}
