import { createApiClient } from "../lib/core";

export const apiClient = createApiClient({
  baseURL: "http://localhost:8000",
});
