import * as balanceSchema from "../../../modules/balances/infra/drizzle/schemas/balance-schema";
import * as accountTypeSchema from "../../../modules/bank-accounts/infra/drizzle/schemas/account-type-schema";
import * as bankAccountSchema from "../../../modules/bank-accounts/infra/drizzle/schemas/bank-account-schema";
import * as categorySchema from "../../../modules/categories/infra/drizzle/schemas/category-schema";
import * as colorSchema from "../../../modules/colors/infra/drizzle/schemas/color-schema";
import * as transactionSchema from "../../../modules/transactions/infra/drizzle/schemas/transaction-schema";
import * as authSchema from "./schemas/auth-schema";

export const schema = {
	...authSchema,
	...bankAccountSchema,
	...balanceSchema,
	...transactionSchema,
	...colorSchema,
	...accountTypeSchema,
	...categorySchema,
} as const;

export type Schema = typeof schema;
