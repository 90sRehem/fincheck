import { env } from "../config/env";
import { createApiClient } from "../lib/core";
import { tokenService } from "../lib/token";

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
	interceptors: {
		request: [
			(request) => {
				console.log(`🚀 ${request.method} ${request.url}`, {
					body: request.body,
					params: request.params,
				});
				return request;
			},
		],
		response: [
			(response) => {
				console.log(`✅ ${response.status}`, {
					data: response.data,
				});
				return response;
			},
		],
		error: [
			async (error) => {
				const UNAUTHORIZED_STATUS = 401;
				const FORBIDDEN_STATUS = 403;

				console.log(`❌ ${error.statusCode}`, {
					message: error.message,
					response: error.response,
				});

				if (error.statusCode === UNAUTHORIZED_STATUS) {
					tokenService.notifyTokenExpired();
				}

				if (error.statusCode === FORBIDDEN_STATUS) {
					console.warn("🚫 Acesso negado");
				}

				throw error;
			},
		],
	},
});
