import { ApiError, type ApiErrorResponse } from "@/shared/api/api-error";
import type {
	HttpClient,
	HttpRequest,
	HttpResponse,
	InterceptorConfig,
} from "./http-client";
import { resolveHeaders } from "./resolve-headers";

type FetchHttpClientOptions = {
	baseURL: string;
	headers?: () => Promise<Record<string, string>>;
	interceptors?: InterceptorConfig;
};

export class FetchHttpClient implements HttpClient {
	constructor(private options: FetchHttpClientOptions) {}

	private normalizeErrorResponse(
		data: unknown,
		statusCode: number,
	): ApiErrorResponse {
		if (typeof data === "string") {
			return {
				message: data,
				statusCode,
			};
		}

		if (data && typeof data === "object") {
			const errorData = data as Partial<ApiErrorResponse>;
			return {
				message: errorData.message || "Erro desconhecido",
				statusCode: errorData.statusCode || statusCode,
				errors: errorData.errors,
				timestamp: errorData.timestamp,
			};
		}

		return {
			message: "Erro desconhecido",
			statusCode,
		};
	}

	private async executeRequestInterceptors<TBody>(
		request: HttpRequest<TBody>,
	): Promise<HttpRequest<TBody>> {
		if (!this.options.interceptors?.request) {
			return request;
		}

		let processedRequest = request;
		for (const interceptor of this.options.interceptors.request) {
			processedRequest = await interceptor<TBody>(processedRequest);
		}
		return processedRequest;
	}

	private async executeResponseInterceptors<TResponse>(
		response: HttpResponse<TResponse>,
	): Promise<HttpResponse<TResponse>> {
		if (!this.options.interceptors?.response) {
			return response;
		}

		let processedResponse = response;
		for (const interceptor of this.options.interceptors.response) {
			processedResponse = await interceptor(processedResponse);
		}
		return processedResponse;
	}

	private async executeErrorInterceptors<TResponse>(
		error: ApiError,
	): Promise<HttpResponse<TResponse> | never> {
		if (!this.options.interceptors?.error) {
			throw error;
		}

		let currentError = error;
		for (const interceptor of this.options.interceptors.error) {
			try {
				const result = await interceptor<TResponse>(currentError);
				// Se interceptor retornar HttpResponse, converte erro em sucesso
				return result;
			} catch (interceptorError) {
				// Se interceptor lançar erro, usa o novo erro
				if (interceptorError instanceof ApiError) {
					currentError = interceptorError;
				} else {
					// Se não for ApiError, mantém o erro original
					throw currentError;
				}
			}
		}

		// Se nenhum interceptor converteu em sucesso, lança o último erro
		throw currentError;
	}

	private async request<TResponse, TBody>(
		request: HttpRequest<TBody>,
	): Promise<HttpResponse<TResponse>> {
		try {
			const processedRequest = await this.executeRequestInterceptors(request);

			const url = new URL(processedRequest.url, this.options.baseURL);

			if (processedRequest.params) {
				Object.entries(processedRequest.params).forEach(([key, value]) => {
					url.searchParams.append(key, String(value));
				});
			}

			const headers = await resolveHeaders(
				this.options.headers,
				processedRequest.headers,
			);

			const response = await fetch(url.toString(), {
				method: processedRequest.method,
				credentials: "include",
				headers: {
					"content-type": "application/json;charset=utf-8",
					...headers,
				},
				body: processedRequest.body
					? JSON.stringify(processedRequest.body)
					: undefined,
			});

			const data = await response.json();

			if (!response.ok) {
				const errorResponse = this.normalizeErrorResponse(
					data,
					response.status,
				);
				const apiError = new ApiError(response.status, errorResponse);

				return await this.executeErrorInterceptors<TResponse>(apiError);
			}

			const httpResponse: HttpResponse<TResponse> = {
				status: response.status,
				data: data as TResponse,
				headers: Object.fromEntries(response.headers.entries()),
			};

			return await this.executeResponseInterceptors(httpResponse);
		} catch (error) {
			if (error instanceof ApiError) {
				return await this.executeErrorInterceptors<TResponse>(error);
			}

			if (error instanceof TypeError && error.message.includes("fetch")) {
				const networkError = new ApiError(0, {
					message: "Erro de rede",
					statusCode: 0,
				});
				return await this.executeErrorInterceptors<TResponse>(networkError);
			}

			const unknownError = new ApiError(500, {
				message: "Erro inesperado. Tente novamente.",
				statusCode: 500,
			});
			return await this.executeErrorInterceptors<TResponse>(unknownError);
		}
	}

	async get<TResponse>(
		request: Omit<HttpRequest, "body" | "method">,
	): Promise<HttpResponse<TResponse>> {
		return this.request<TResponse, never>({
			...request,
			method: "GET",
		});
	}

	async post<TResponse, TBody>(
		request: Omit<HttpRequest<TBody>, "method">,
	): Promise<HttpResponse<TResponse>> {
		return this.request<TResponse, TBody>({
			...request,
			method: "POST",
		});
	}

	async put<TResponse, TBody>(
		request: Omit<HttpRequest<TBody>, "method">,
	): Promise<HttpResponse<TResponse>> {
		return this.request<TResponse, TBody>({
			...request,
			method: "PUT",
		});
	}

	async patch<TResponse, TBody>(
		request: Omit<HttpRequest<TBody>, "method">,
	): Promise<HttpResponse<TResponse>> {
		return this.request<TResponse, TBody>({
			...request,
			method: "PATCH",
		});
	}

	async delete<TResponse>(
		request: Omit<HttpRequest, "body" | "method">,
	): Promise<HttpResponse<TResponse>> {
		return this.request<TResponse, never>({
			...request,
			method: "DELETE",
		});
	}
}
