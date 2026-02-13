import { FetchHttpClient } from "./fetch-http-client";
import type { HttpClient, InterceptorConfig } from "./http-client";

type CreateApiClientOptions = {
	baseURL: string;
	headers?: () => Promise<Record<string, string>>;
	interceptors?: InterceptorConfig;
};

export function createApiClient({
	baseURL,
	headers,
	interceptors,
}: CreateApiClientOptions): HttpClient {
	return new FetchHttpClient({ baseURL, headers, interceptors });
}
