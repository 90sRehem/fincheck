import * as balanceSchema from "../../../modules/balances/infra/drizzle/schemas/balance-schema";
import * as bankAccountSchema from "../../../modules/bank-accounts/infra/drizzle/schemas/bank-account-schema";
import * as transactionSchema from "../../../modules/transactions/infra/drizzle/schemas/transaction-schema";
import * as authSchema from "./schemas/auth-schema";

export const schema = {
	...authSchema,
	...bankAccountSchema,
	...balanceSchema,
	...transactionSchema,
} as const;

export type Schema = typeof schema;
