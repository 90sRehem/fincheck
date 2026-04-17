import { z } from "zod";
import { TRANSACTION_TYPE } from "../../domain/value-objects/transaction-type";

const TITLE_MIN_LENGTH = 1;
const TITLE_MAX_LENGTH = 255;
const AMOUNT_MIN = 0;
const HEX_COLOR_LENGTH = 7;

export const createTransactionSchema = z.object({
	accountId: z.string().uuid("accountId must be a valid UUID"),
	title: z
		.string()
		.min(TITLE_MIN_LENGTH, "title is required")
		.max(
			TITLE_MAX_LENGTH,
			`title must have at most ${TITLE_MAX_LENGTH} characters`,
		),
	amountCents: z.number().int("amountCents must be an integer").min(AMOUNT_MIN),
	type: z.enum([TRANSACTION_TYPE.EXPENSE, TRANSACTION_TYPE.REVENUE]),
	color: z
		.string()
		.length(HEX_COLOR_LENGTH, "color must be a valid hex color (#RRGGBB)")
		.regex(/^#[0-9A-Fa-f]{6}$/, "color must be a valid hex color (#RRGGBB)"),
	category: z.string().nullable().optional(),
	date: z.string().datetime("date must be a valid ISO 8601 datetime string"),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
