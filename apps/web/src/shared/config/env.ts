import { z } from "zod";

export const envSchema = z.object({
	VITE_API_BASE_URL: z.url(),
	VITE_API_URL: z.url(),
});

export const env = envSchema.parse(import.meta.env);
