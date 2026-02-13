import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

export function createDrizzleConnection(databaseUrl: string) {
	const pool = new Pool({
		connectionString: databaseUrl,
	});

	return drizzle(pool);
}

export type DrizzleDB = ReturnType<typeof createDrizzleConnection>;
