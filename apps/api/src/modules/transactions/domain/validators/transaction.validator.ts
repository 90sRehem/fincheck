import { z } from "zod";
import type { Either } from "@/shared/domain/types";
import type { ValidationFieldsError } from "@/shared/domain/validators";
import { ZodValidationStrategy } from "@/shared/domain/validators/zod-validation-strategy";
import { TransactionProps } from "../entities/transaction.entity";
import {
	TRANSACTION_COLOR,
	type TransactionColor,
} from "../value-objects/transaction-color";
import { TRANSACTION_TYPE } from "../value-objects/transaction-type";

const TITLE_MAX_LENGTH = 255;

const schema = z.object({
	userId: z.uuid({ message: "userId must be a valid UUID" }),
	accountId: z.uuid({ message: "accountId must be a valid UUID" }),
	title: z
		.string()
		.min(1, "title is required")
		.max(
			TITLE_MAX_LENGTH,
			`title must have at most ${TITLE_MAX_LENGTH} characters`,
		),
	amountCents: z
		.number()
		.int("amountCents must be an integer")
		.min(0, "amountCents must be at least 0"),
	type: z.enum([TRANSACTION_TYPE.EXPENSE, TRANSACTION_TYPE.REVENUE]),
	color: z.enum(
		Object.values(TRANSACTION_COLOR) as [
			TransactionColor,
			...TransactionColor[],
		],
		{ message: "color must be a valid color name" },
	),
	category: z.string().nullable(),
	date: z.date(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

const validator = new ZodValidationStrategy<TransactionProps>(schema);

export class TransactionValidator {
	static validate(data: TransactionProps): Either<ValidationFieldsError, void> {
		return validator.validate(data);
	}
}
