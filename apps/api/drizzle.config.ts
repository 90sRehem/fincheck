/** biome-ignore-all lint/style/noDefaultExport: <explanation> */
import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
	schema: "./src/core/database/drizzle/schemas/*",
	out: "./src/core/database/drizzle/migrations",
	dialect: "postgresql",
	dbCredentials: {
		url: process.env.DATABASE_URL!,
	},
});
