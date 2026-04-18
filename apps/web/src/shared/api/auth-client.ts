import { env } from "../config/env";
import { createApiClient } from "../lib/core";
import { createInterceptors } from "./interceptors";

export const authClient = createApiClient({
	baseURL: env.VITE_API_BASE_URL,
	headers: async () => ({
		"Content-Type": "application/json",
	}),
	interceptors: createInterceptors(),
});
