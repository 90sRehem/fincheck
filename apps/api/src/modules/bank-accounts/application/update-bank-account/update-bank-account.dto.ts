import { z } from "zod";

const DEFAULT_BALANCE = 0;
const DEFAULT_CURRENCY = "BRL";
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
	accountTypeId: z.string().min(1, "accountTypeId is required").optional(),
	initialBalance: z.number().default(DEFAULT_BALANCE).optional(),
	currencyId: z.string().default(DEFAULT_CURRENCY).optional(),
	colorId: z.string().min(1, "colorId is required").optional(),
	icon: z.string().nullable().optional(),
});

export type UpdateBankAccountInput = z.infer<typeof updateBankAccountSchema>;
