import { relations } from "drizzle-orm";
import { pgTable, text } from "drizzle-orm/pg-core";

export const currencies = pgTable("currencies", {
	id: text("id").primaryKey(),
	code: text("code").unique().notNull(),
	name: text("name").notNull(),
});

export const currenciesRelations = relations(currencies, () => ({}));
