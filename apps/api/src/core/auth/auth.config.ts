import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { openAPI } from "better-auth/plugins";
import { v4 as uuidv4 } from "uuid";
import { DrizzleDB } from "../database/connection";
import { Env } from "../env/env.schema";

export function createAuthConfig(
	db: DrizzleDB,
	env: { get<T extends keyof Env>(key: T): Env[T] },
) {
	return betterAuth({
		database: drizzleAdapter(db, {
			provider: "pg",
			usePlural: true, // Use plural table names (users instead of user)
		}),
		plugins: [openAPI()],
		secret: env.get("BETTER_AUTH_SECRET"),
		baseURL: env.get("BETTER_AUTH_URL"),
		emailAndPassword: {
			enabled: true,
			requireEmailVerification: false,
		},
		session: {
			cookieCache: {
				enabled: true,
				maxAge: 5 * 60, // 5 minutes
			},
		},
		advanced: {
			database: {
				generateId: () => uuidv4(),
			},
		},
		trustedOrigins: [env.get("WEB_CLIENT_URL")],
	});
}
