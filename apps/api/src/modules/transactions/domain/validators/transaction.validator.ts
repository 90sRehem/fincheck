import { z } from "zod";
import { ZodValidationStrategy } from "@/shared/domain/validators/zod-validation-strategy";
import { TRANSACTION_TYPE } from "../value-objects/transaction-type";

const TITLE_MAX_LENGTH = 255;
const HEX_COLOR_LENGTH = 7;

export interface TransactionProps {
	userId: string;
	accountId: string;
	title: string;
	amountCents: number;
	type: (typeof TRANSACTION_TYPE)[keyof typeof TRANSACTION_TYPE];
	color: string;
	category: string | null;
	date: Date;
	createdAt: Date;
	updatedAt: Date;
}

export class TransactionValidator extends ZodValidationStrategy<TransactionProps> {
	constructor() {
		super(
			z.object({
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
				color: z
					.string()
					.length(HEX_COLOR_LENGTH, "color must be a valid hex color (#RRGGBB)")
					.regex(
						/^#[0-9A-Fa-f]{6}$/,
						"color must be a valid hex color (#RRGGBB)",
					),
				category: z.string().nullable(),
				date: z.date(),
				createdAt: z.date(),
				updatedAt: z.date(),
			}),
		);
	}
}
