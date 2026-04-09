import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { schema } from "./drizzle/schema-registry";

export function createDrizzleConnection(databaseUrl: string) {
	const pool = new Pool({
		connectionString: databaseUrl,
	});

	return drizzle(pool, { schema });
}

export type DrizzleDB = ReturnType<typeof createDrizzleConnection>;
