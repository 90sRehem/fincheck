import type {
	DefaultOptions,
	QueryKey,
	UseMutationOptions,
	UseQueryOptions,
} from "@tanstack/react-query";
import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { ApiError } from "@/shared/api";
import { reportError } from "../core/error/error-reporter";

declare module "@tanstack/react-query" {
	interface Register {
		defaultError: ApiError;
		mutationMeta: {
			invalidatesQuery?: QueryKey;
			successMessage?: string;
			errorMessage?: string;
		};
	}
}

const queryConfig: DefaultOptions = {
	queries: {
		throwOnError: true,
		refetchOnWindowFocus: false,
		retry: (failureCount, error) => {
			if (
				error instanceof ApiError &&
				error.statusCode >= 400 &&
				error.statusCode < 500
			) {
				return false;
			}
			return failureCount < 3;
		},
	},
};

const mutationCache = new MutationCache({
	onSuccess: (_data, _variables, _context, mutation) => {
		if (mutation.meta?.successMessage) {
			// toast({
			//   title: mutation.meta.successMessage,
			//   variant: "success",
			// });
		}
	},

	onError: (error, _variables, _context, mutation) => {
		let errorMessage = mutation.meta?.errorMessage;

		if (error instanceof ApiError) {
			errorMessage = errorMessage || error.getFirstErrorMessage();
			console.error("Mutation error:", {
				message: errorMessage,
				status: error.statusCode,
				details: error.errors,
			});
		} else {
			errorMessage = errorMessage || "Ocorreu um erro inesperado";
			console.error("Mutation error:", errorMessage, error);
		}

		// toast({
		//   title: errorMessage,
		//   variant: "error",
		// });
	},

	onSettled: (_data, _error, _variables, _context, mutation) => {
		if (mutation.meta?.invalidatesQuery) {
			queryClient.invalidateQueries({
				queryKey: mutation.meta?.invalidatesQuery,
			});
		}
	},
});

const queryCache = new QueryCache({
	onError: (error, query) => {
		if (error instanceof ApiError) {
			console.error(`Query error [${query.queryKey}]:`, {
				status: error.statusCode,
				message: error.message,
				errors: error.errors,
			});

			if (error.statusCode === 401 || error.statusCode === 403) {
				// userStore.getState().clearUser();
				// window.location.href = "/session/login";
			}
		} else {
			console.error(`Query error [${query.queryKey}]:`, error);

			reportError(error, { queryKey: query.queryKey });
		}
	},
});

export const queryClient = new QueryClient({
	defaultOptions: queryConfig,
	mutationCache,
	queryCache,
});

export type ExtractFnReturnType<FnType extends (...args: any) => any> = Awaited<
	ReturnType<FnType>
>;

export type QueryConfig<QueryFnType extends (...args: any) => any> = Omit<
	UseQueryOptions<ExtractFnReturnType<QueryFnType>>,
	"queryKey" | "queryFn"
>;

export type MutationConfig<MutationFnType extends (...args: any) => any> =
	UseMutationOptions<
		ExtractFnReturnType<MutationFnType>,
		ApiError,
		Parameters<MutationFnType>[0],
		unknown
	>;
