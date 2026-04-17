import { z } from "zod";
import { TRANSACTION_TYPE } from "../../domain/value-objects/transaction-type";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;
const MIN_MONTH = 1;
const MAX_MONTH = 12;

export const listTransactionsSchema = z.object({
	accountId: z.string().uuid().optional(),
	year: z.coerce.number().int().optional(),
	month: z.coerce.number().int().min(MIN_MONTH).max(MAX_MONTH).optional(),
	type: z.enum([TRANSACTION_TYPE.EXPENSE, TRANSACTION_TYPE.REVENUE]).optional(),
	_page: z.coerce.number().int().min(1).default(DEFAULT_PAGE),
	_limit: z.coerce.number().int().min(1).max(MAX_LIMIT).default(DEFAULT_LIMIT),
	_sort: z.string().default("createdAt"),
	_order: z.enum(["asc", "desc"]).default("desc"),
});

export type ListTransactionsInput = z.infer<typeof listTransactionsSchema>;
