import { z } from "zod";
import { BANK_ACCOUNT_TYPE } from "@/modules/bank-accounts/domain";

const DEFAULT_BALANCE = 0;
const DEFAULT_CURRENCY = "BRL";
const HEX_COLOR_LENGTH = 7;
const NAME_MAX_LENGTH = 100;

export const updateBankAccountSchema = z.object({
	name: z
		.string()
		.min(1, "name is required")
		.max(
			NAME_MAX_LENGTH,
			`name must have at most ${NAME_MAX_LENGTH} characters`,
		)
		.optional(),
	type: z
		.enum([
			BANK_ACCOUNT_TYPE.CHECKING,
			BANK_ACCOUNT_TYPE.SAVINGS,
			BANK_ACCOUNT_TYPE.CREDIT_CARD,
			BANK_ACCOUNT_TYPE.CASH,
			BANK_ACCOUNT_TYPE.INVESTMENT,
		])
		.optional(),
	initialBalance: z.number().default(DEFAULT_BALANCE).optional(),
	currency: z.string().default(DEFAULT_CURRENCY).optional(),
	color: z
		.string()
		.length(HEX_COLOR_LENGTH, "color must be a valid hex color (#RRGGBB)")
		.regex(/^#[0-9A-Fa-f]{6}$/, "color must be a valid hex color (#RRGGBB)")
		.optional(),
	icon: z.string().nullable().optional(),
});

export type UpdateBankAccountInput = z.infer<typeof updateBankAccountSchema>;
