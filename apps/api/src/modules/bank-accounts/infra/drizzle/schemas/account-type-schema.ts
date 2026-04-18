import { pgTable, text } from "drizzle-orm/pg-core";

export const accountTypes = pgTable("account_types", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
});
