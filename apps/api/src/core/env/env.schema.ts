import z from "zod";

const PORT = 3333;

export const envSchema = z.object({
	PORT: z.coerce.number().optional().default(PORT),
	DATABASE_URL: z.string().url(),
	BETTER_AUTH_SECRET: z.string(),
	BETTER_AUTH_URL: z.string(),
});

export type Env = z.infer<typeof envSchema>;

declare global {
	namespace NodeJS {
		interface ProcessEnv extends Env {}
	}
}
