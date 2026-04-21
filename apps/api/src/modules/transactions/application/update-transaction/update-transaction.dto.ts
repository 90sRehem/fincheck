import { z } from "zod";
import {
	TRANSACTION_COLOR,
	type TransactionColor,
} from "../../domain/value-objects/transaction-color";
import { TRANSACTION_TYPE } from "../../domain/value-objects/transaction-type";

const TITLE_MIN_LENGTH = 1;
const TITLE_MAX_LENGTH = 255;
const AMOUNT_MIN = 0;

export const updateTransactionSchema = z.object({
	accountId: z.string().uuid("accountId must be a valid UUID").optional(),
	title: z
		.string()
		.min(TITLE_MIN_LENGTH, "title is required")
		.max(
			TITLE_MAX_LENGTH,
			`title must have at most ${TITLE_MAX_LENGTH} characters`,
		)
		.optional(),
	amountCents: z
		.number()
		.int("amountCents must be an integer")
		.min(AMOUNT_MIN)
		.optional(),
	type: z.enum([TRANSACTION_TYPE.EXPENSE, TRANSACTION_TYPE.REVENUE]).optional(),
	color: z
		.enum(
			Object.values(TRANSACTION_COLOR) as [
				TransactionColor,
				...TransactionColor[],
			],
			{ message: "color must be a valid color name" },
		)
		.optional(),
	category: z.string().nullable().optional(),
	date: z
		.string()
		.datetime("date must be a valid ISO 8601 datetime string")
		.optional(),
});

export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
