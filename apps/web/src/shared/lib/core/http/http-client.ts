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
