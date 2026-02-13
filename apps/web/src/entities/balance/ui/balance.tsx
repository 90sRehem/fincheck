import { Amount, IconButton } from "@fincheck/design-system";
import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { Suspense } from "react";
import { useBalance } from "../model/use-balance";
import { ErrorBoundary } from "react-error-boundary";
import {
  useBalanceVisibility,
  toggleBalanceVisibility,
} from "@/pages/home/model/balance-visibility-store";

type BalanceProps = {
  userId: string;
};

export function BalanceComponent({ userId }: Readonly<BalanceProps>) {
  const { amount } = useBalance({ userId });
  const hideAmount = useBalanceVisibility();
  const showValue = hideAmount ? "hide" : "show";

  return (
    <div className="flex flex-col items-start p-0 h-[72px]">
      <span className="body-normal-regular text-white">Saldo total</span>
      <div className="flex flex-row items-center p-0 gap-2 h-12">
        <Amount
          className="heading-1 text-white transition-all duration-300 data-[show-value=hide]:blur-sm"
          data-show-value={showValue}
          variant="default"
          state={showValue === "show" ? "show" : "hide"}
        >
          {amount ?? 0}
        </Amount>
        <IconButton
          icon={showValue === "show" ? "EyeOpen" : "EyeClosed"}
          className="text-white"
          onClick={toggleBalanceVisibility}
        />
      </div>
    </div>
  );
}

function BalanceSkeleton() {
  return (
    <div className="flex flex-col items-start p-0 h-[72px] shrink-0">
      <span className="body-normal-regular text-white">Saldo total</span>
      <div className="flex flex-row items-center p-0 gap-2 h-12">
        <div className="h-8 w-32 bg-white/20 rounded animate-pulse" />
        <div className="size-6 bg-white/20 rounded animate-pulse" />
      </div>
    </div>
  );
}

type ErrorFallbackProps = {
  error: Error;
  resetErrorBoundary: Function;
};

function BalanceErrorFallback({
  error,
  resetErrorBoundary,
}: Readonly<ErrorFallbackProps>) {
  return (
    <button
      type="button"
      onClick={() => resetErrorBoundary()}
      className="flex flex-col items-start p-0 h-[72px] w-full bg-transparent border-0 cursor-pointer hover:opacity-80 transition-opacity"
      title="Erro ao carregar saldo. Clique para tentar novamente"
    >
      <span className="body-normal-regular text-white">Saldo total</span>
      <div className="flex flex-row items-center p-0 gap-2 h-12">
        <span className="heading-1 text-red-2">Erro ao carregar</span>
        <div className="size-6 flex items-center justify-center">
          <span
            className="text-red-1
            text-sm"
          >
            ↻
          </span>
        </div>
      </div>
    </button>
  );
}

export function Balance({ userId }: Readonly<BalanceProps>) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary onReset={reset} FallbackComponent={BalanceErrorFallback}>
          <Suspense fallback={<BalanceSkeleton />}>
            <BalanceComponent userId={userId} />
          </Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}
