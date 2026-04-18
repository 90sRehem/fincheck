import { z } from "zod";

const DEFAULT_BALANCE = 0;
const DEFAULT_CURRENCY = "BRL";
const NAME_MAX_LENGTH = 100;

export const createBankAccountSchema = z.object({
	name: z
		.string()
		.min(1, "name is required")
		.max(
			NAME_MAX_LENGTH,
			`name must have at most ${NAME_MAX_LENGTH} characters`,
		),
	accountTypeId: z.string().min(1, "accountTypeId is required"),
	initialBalance: z.number().default(DEFAULT_BALANCE),
	currencyId: z.string().default(DEFAULT_CURRENCY),
	colorId: z.string().min(1, "colorId is required"),
	icon: z.string().nullable().optional(),
});

export type CreateBankAccountInput = z.infer<typeof createBankAccountSchema>;
