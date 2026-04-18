import { env } from "../config/env";
import { createApiClient } from "../lib/core";
import { tokenService } from "../lib/token";
import { createInterceptors } from "./interceptors";

export const apiClient = createApiClient({
	baseURL: env.VITE_API_URL,
	headers: async () => {
		const headers: Record<string, string> = {
			"Content-Type": "application/json",
		};

		const token = tokenService.getToken();
		if (token) {
			headers.Authorization = `Bearer ${token}`;
		}

		return headers;
	},
	interceptors: createInterceptors(),
});
