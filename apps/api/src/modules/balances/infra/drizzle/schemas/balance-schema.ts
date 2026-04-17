import { relations } from "drizzle-orm";
import {
	bigint,
	index,
	pgTable,
	text,
	timestamp,
	unique,
} from "drizzle-orm/pg-core";
import { users } from "@/core/database/drizzle/schemas/auth-schema";
import { bankAccounts } from "@/modules/bank-accounts/infra/drizzle/schemas/bank-account-schema";

export const balances = pgTable(
	"balances",
	{
		id: text("id").primaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		bankAccountId: text("bank_account_id")
			.notNull()
			.references(() => bankAccounts.id, { onDelete: "cascade" }),
		amountCents: bigint("amount_cents", { mode: "number" })
			.notNull()
			.default(0),
		currency: text("currency").notNull().default("BRL"),
		updatedAt: timestamp("updated_at")
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [
		index("balances_userId_idx").on(table.userId),
		unique("balances_bankAccountId_unique").on(table.bankAccountId),
	],
);

export const balancesRelations = relations(balances, ({ one }) => ({
	user: one(users, {
		fields: [balances.userId],
		references: [users.id],
	}),
	bankAccount: one(bankAccounts, {
		fields: [balances.bankAccountId],
		references: [bankAccounts.id],
	}),
}));
