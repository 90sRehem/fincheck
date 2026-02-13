import type { ApiError } from "@/shared/api/api-error";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type Headers =
	| Record<string, string>
	| (() => Record<string, string> | Promise<Record<string, string>>);

export interface HttpRequest<TBody = unknown> {
	url: string;
	method: HttpMethod;
	headers?: Headers;
	body?: TBody;
	params?: Record<string, string | number | boolean>;
}

export interface HttpResponse<T = unknown> {
	status: number;
	data: T;
	headers?: Headers;
}

export interface PaginationInfo {
	currentPage: number;
	totalPages: number;
	totalItems: number;
	itemsPerPage: number;
	hasNextPage: boolean;
}

export interface PaginatedResponse<T> {
	data: T[];
	pagination: PaginationInfo;
}

// Interceptor types
export type RequestInterceptor = <TBody = unknown>(
	request: HttpRequest<TBody>,
) => HttpRequest<TBody> | Promise<HttpRequest<TBody>>;

export type ResponseInterceptor = <T = unknown>(
	response: HttpResponse<T>,
) => HttpResponse<T> | Promise<HttpResponse<T>>;

export type ErrorInterceptor = <T = unknown>(
	error: ApiError,
) => Promise<never> | Promise<HttpResponse<T>>;

export interface InterceptorConfig {
	request?: RequestInterceptor[];
	response?: ResponseInterceptor[];
	error?: ErrorInterceptor[];
}

export interface HttpClient {
	get<TResponse = unknown>(
		request: Omit<HttpRequest, "body" | "method">,
	): Promise<HttpResponse<TResponse>>;

	post<TResponse = unknown, TBody = unknown>(
		request: Omit<HttpRequest<TBody>, "method">,
	): Promise<HttpResponse<TResponse>>;

	put<TResponse = unknown, TBody = unknown>(
		request: Omit<HttpRequest<TBody>, "method">,
	): Promise<HttpResponse<TResponse>>;

	patch<TResponse = unknown, TBody = unknown>(
		request: Omit<HttpRequest<TBody>, "method">,
	): Promise<HttpResponse<TResponse>>;

	delete<TResponse = unknown>(
		request: Omit<HttpRequest, "body" | "method">,
	): Promise<HttpResponse<TResponse>>;
}
