import { FetchHttpClient } from "./fetch-http-client";
import type { HttpClient } from "./http-client";

type CreateApiClientOptions = {
  baseURL: string;
  headers?: () => Promise<Record<string, string>>;
};

export function createApiClient({
  baseURL,
  headers,
}: CreateApiClientOptions): HttpClient {
  return new FetchHttpClient({ baseURL, headers });
}
