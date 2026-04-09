import * as bankAccountSchema from "../../../modules/bank-accounts/infra/drizzle/schemas/bank-account-schema";
import * as authSchema from "./schemas/auth-schema";

export const schema = {
	...authSchema,
	...bankAccountSchema,
} as const;

export type Schema = typeof schema;
