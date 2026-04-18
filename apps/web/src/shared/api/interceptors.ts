import { tokenService } from "../lib/token";

const UNAUTHORIZED_STATUS = 401;
const FORBIDDEN_STATUS = 403;

export const createInterceptors = () => ({
	request: [
		(request) => {
			// Only log in development, without sensitive data
			if (import.meta.env.DEV) {
				console.log(`🚀 ${request.method} ${request.url}`);
			}
			return request;
		},
	],
	response: [
		(response) => {
			// Only log in development, without sensitive data
			if (import.meta.env.DEV) {
				console.log(`✅ ${response.status}`);
			}
			return response;
		},
	],
	error: [
		async (error) => {
			// Log error status in development only, without sensitive data
			if (import.meta.env.DEV) {
				console.log(`❌ ${error.statusCode}`);
			}

			if (error.statusCode === UNAUTHORIZED_STATUS) {
				tokenService.notifyTokenExpired();
			}

			if (error.statusCode === FORBIDDEN_STATUS) {
				console.warn("🚫 Acesso negado");
			}

			throw error;
		},
	],
});
