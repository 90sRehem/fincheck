import { Logo } from "@/shared/ui";

export function HomeSkeleton() {
  return (
    <main className="h-screen w-screen bg-white p-4 overflow-y-hidden">
      <div className="flex flex-col gap-2 h-full">
        {/* Header Skeleton */}
        <header className="flex flex-row justify-between items-center py-2 px-0 gap-2 w-full h-16">
          <Logo className="text-teal-9 size-30" />
          <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse" />
        </header>

        <div className="flex flex-col 2xl:flex-row gap-8 h-full">
          {/* Balance & Accounts Panel Skeleton */}
          <article className="flex flex-col justify-center items-start px-4 py-8 gap-10 w-full lg:flex-1 min-h-0 bg-teal-9 rounded-2xl h-full">
            {/* Balance Skeleton */}
            <div className="w-full space-y-3">
              <div className="h-6 w-40 bg-white/20 rounded animate-pulse" />
              <div className="h-10 w-56 bg-white/20 rounded animate-pulse" />
            </div>

            {/* Accounts List Skeleton */}
            <div className="w-full space-y-4">
              <div className="h-6 w-32 bg-white/20 rounded animate-pulse" />
              <div className="flex gap-4 overflow-hidden">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="min-w-[280px] h-32 bg-white/10 rounded-xl p-4 space-y-3"
                  >
                    <div className="h-5 w-24 bg-white/20 rounded animate-pulse" />
                    <div className="h-8 w-36 bg-white/20 rounded animate-pulse" />
                    <div className="h-4 w-20 bg-white/20 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </article>

          {/* Transactions Panel Skeleton */}
          <article className="w-full lg:flex-1 px-4 py-6 rounded-2xl bg-gray-0 h-full">
            <div className="space-y-4">
              <div className="h-8 w-40 bg-gray-200 rounded animate-pulse" />

              {/* Transaction Items Skeleton */}
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 bg-white rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 bg-gray-200 rounded-full animate-pulse" />
                      <div className="space-y-2">
                        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                        <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
                      </div>
                    </div>
                    <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </article>
        </div>
      </div>

      {/* FAB Skeleton */}
      <div className="fixed bottom-8 right-8 h-14 w-14 bg-teal-9 rounded-full animate-pulse" />
    </main>
  );
}
