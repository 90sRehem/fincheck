import { relations } from "drizzle-orm";
import {
	index,
	numeric,
	pgEnum,
	pgTable,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import { users } from "@/core/database/drizzle/schemas/auth-schema";

export const bankAccountTypeEnum = pgEnum("bank_account_type", [
	"checking",
	"savings",
	"credit_card",
	"cash",
	"investment",
]);

export const bankAccounts = pgTable(
	"bank_accounts",
	{
		id: text("id").primaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		name: text("name").notNull(),
		type: bankAccountTypeEnum("type").notNull(),
		initialBalance: numeric("initial_balance", { precision: 12, scale: 2 })
			.notNull()
			.default("0"),
		currentBalance: numeric("current_balance", { precision: 12, scale: 2 })
			.notNull()
			.default("0"),
		currency: text("currency").notNull().default("BRL"),
		color: text("color").notNull(),
		icon: text("icon"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [index("bankAccounts_userId_idx").on(table.userId)],
);

export const bankAccountsRelations = relations(bankAccounts, ({ one }) => ({
	users: one(users, {
		fields: [bankAccounts.userId],
		references: [users.id],
	}),
}));
