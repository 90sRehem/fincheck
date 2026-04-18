import { pgTable, text } from "drizzle-orm/pg-core";

export const colors = pgTable("colors", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	hex: text("hex").notNull(),
});
