import { relations } from "drizzle-orm";
import { index, numeric, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "@/core/database/drizzle/schemas/auth-schema";
import { colors } from "../../../../colors/infra/drizzle/schemas/color-schema";
import { currencies } from "../../../../currencies/infra/drizzle/schemas/currency-schema";
import { accountTypes } from "./account-type-schema";

export const bankAccounts = pgTable(
	"bank_accounts",
	{
		id: text("id").primaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		name: text("name").notNull(),
		accountTypeId: text("account_type_id")
			.notNull()
			.references(() => accountTypes.id),
		initialBalance: numeric("initial_balance", { precision: 12, scale: 2 })
			.notNull()
			.default("0"),
		currencyId: text("currency_id")
			.notNull()
			.default("BRL")
			.references(() => currencies.id),
		colorId: text("color_id")
			.notNull()
			.references(() => colors.id),
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
	color: one(colors, {
		fields: [bankAccounts.colorId],
		references: [colors.id],
	}),
	accountType: one(accountTypes, {
		fields: [bankAccounts.accountTypeId],
		references: [accountTypes.id],
	}),
	currency: one(currencies, {
		fields: [bankAccounts.currencyId],
		references: [currencies.id],
	}),
}));
