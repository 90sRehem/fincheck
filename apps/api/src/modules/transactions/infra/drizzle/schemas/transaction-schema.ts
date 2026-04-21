import { relations } from "drizzle-orm";
import {
	index,
	integer,
	pgEnum,
	pgTable,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import { users } from "@/core/database/drizzle/schemas/auth-schema";
import { bankAccounts } from "@/modules/bank-accounts/infra/drizzle/schemas/bank-account-schema";
import { TRANSACTION_COLOR, type TransactionColor } from "../../../domain";

export const transactionTypeEnum = pgEnum("transaction_type", [
	"expense",
	"revenue",
]);

export const transactionColorEnum = pgEnum(
	"transaction_color",
	Object.values(TRANSACTION_COLOR) as [TransactionColor, ...TransactionColor[]],
);

export const transactions = pgTable(
	"transactions",
	{
		id: text("id").primaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		accountId: text("account_id")
			.notNull()
			.references(() => bankAccounts.id, { onDelete: "cascade" }),
		title: text("title").notNull(),
		amountCents: integer("amount_cents").notNull(),
		type: transactionTypeEnum("type").notNull(),
		color: transactionColorEnum("color").notNull(),
		category: text("category"),
		date: timestamp("date").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [
		index("transactions_userId_idx").on(table.userId),
		index("transactions_accountId_idx").on(table.accountId),
		index("transactions_date_idx").on(table.date),
	],
);

export const transactionsRelations = relations(transactions, ({ one }) => ({
	user: one(users, {
		fields: [transactions.userId],
		references: [users.id],
	}),
	bankAccount: one(bankAccounts, {
		fields: [transactions.accountId],
		references: [bankAccounts.id],
	}),
}));
