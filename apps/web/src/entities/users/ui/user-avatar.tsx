import { useUser } from "@/entities/users";
import { Avatar as AvatarComponent } from "@fincheck/design-system";
import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

function formatAvatarName(name?: string) {
  if (!name) return "?";

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function Avatar() {
  const { user } = useUser();

  return (
    <AvatarComponent>
      <AvatarComponent.Image src={undefined} />
      <AvatarComponent.Fallback>
        {formatAvatarName(user.name)}
      </AvatarComponent.Fallback>
    </AvatarComponent>
  );
}

type ErrorFallbackProps = {
  error: Error;
  resetErrorBoundary: Function;
};

function ErrorFallback({
  error,
  resetErrorBoundary,
}: Readonly<ErrorFallbackProps>) {
  return (
    <button
      type="button"
      onClick={() => resetErrorBoundary()}
      className="size-12 bg-red-50 text-red-600 rounded-full border border-red-200 hover:bg-red-100 transition-colors cursor-pointer"
      title="Erro ao carregar avatar. Clique para tentar novamente"
    >
      <AvatarComponent className="size-12 bg-red-0 text-red-9">
        <AvatarComponent.Image src={undefined} />
        <AvatarComponent.Fallback>!</AvatarComponent.Fallback>
      </AvatarComponent>
    </button>
  );
}

function AvatarSkeleton() {
  return (
    <AvatarComponent className="size-12 bg-gray-200 animate-pulse">
      <AvatarComponent.Fallback>
        <div className="size-full bg-gray-300 rounded-full" />
      </AvatarComponent.Fallback>
    </AvatarComponent>
  );
}

export function UserAvatar() {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary onReset={reset} FallbackComponent={ErrorFallback}>
          <Suspense fallback={<AvatarSkeleton />}>
            <Avatar />
          </Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}
