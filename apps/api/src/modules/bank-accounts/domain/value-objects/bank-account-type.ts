export const BANK_ACCOUNT_TYPE = {
	CHECKING: "checking",
	SAVINGS: "savings",
	CREDIT_CARD: "credit_card",
	CASH: "cash",
	INVESTMENT: "investment",
} as const;

export type BankAccountType =
	(typeof BANK_ACCOUNT_TYPE)[keyof typeof BANK_ACCOUNT_TYPE];
