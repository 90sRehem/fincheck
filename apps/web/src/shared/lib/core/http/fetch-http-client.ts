import type { HttpClient, HttpRequest, HttpResponse } from "./http-client";
import { resolveHeaders } from "./resolve-headers";
import { ApiError, type ApiErrorResponse } from "@/shared/api/api-error";

type FetchHttpClientOptions = {
  baseURL: string;
  headers?: () => Promise<Record<string, string>>;
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

  private async request<TResponse, TBody>(
    request: HttpRequest<TBody>,
  ): Promise<HttpResponse<TResponse>> {
    const url = new URL(request.url, this.options.baseURL);

    if (request.params) {
      Object.entries(request.params).forEach(([key, value]) =>
        url.searchParams.append(key, String(value)),
      );
    }

    const headers = await resolveHeaders(this.options.headers, request.headers);

    const response = await fetch(url.toString(), {
      method: request.method,
      headers: {
        "content-type": "application/json;charset=utf-8",
        ...headers,
      },
      body: request.body ? JSON.stringify(request.body) : undefined,
    });

    const data = await response.json();

    if (!response.ok) {
      const errorResponse = this.normalizeErrorResponse(data, response.status);
      throw new ApiError(response.status, errorResponse);
    }

    return {
      status: response.status,
      data: data as TResponse,
    };
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
