export const TRANSACTION_TYPE = {
	EXPENSE: "expense",
	REVENUE: "revenue",
} as const;

export type TransactionType =
	(typeof TRANSACTION_TYPE)[keyof typeof TRANSACTION_TYPE];
