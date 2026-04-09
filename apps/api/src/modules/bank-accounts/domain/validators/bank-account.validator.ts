import { z } from "zod";
import { ZodValidationStrategy } from "@/shared/domain/validators/zod-validation-strategy";
import { BANK_ACCOUNT_TYPE } from "../value-objects/bank-account-type";

const NAME_MAX_LENGTH = 100;
const CURRENCY_LENGTH = 3;
const HEX_COLOR_LENGTH = 7;

export interface BankAccountProps {
	userId: string;
	name: string;
	type: (typeof BANK_ACCOUNT_TYPE)[keyof typeof BANK_ACCOUNT_TYPE];
	initialBalance: number;
	currentBalance: number;
	currency: string;
	color: string;
	icon: string | null;
}

export class BankAccountValidator extends ZodValidationStrategy<BankAccountProps> {
	constructor() {
		super(
			z.object({
				userId: z.uuid({ message: "userId must be a valid UUID" }),
				name: z
					.string()
					.min(1, "name is required")
					.max(
						NAME_MAX_LENGTH,
						`name must have at most ${NAME_MAX_LENGTH} characters`,
					),
				type: z.enum([
					BANK_ACCOUNT_TYPE.CHECKING,
					BANK_ACCOUNT_TYPE.SAVINGS,
					BANK_ACCOUNT_TYPE.CREDIT_CARD,
					BANK_ACCOUNT_TYPE.CASH,
					BANK_ACCOUNT_TYPE.INVESTMENT,
				]),
				initialBalance: z.number(),
				currentBalance: z.number(),
				currency: z
					.string()
					.length(
						CURRENCY_LENGTH,
						`currency must be exactly ${CURRENCY_LENGTH} characters`,
					),
				color: z
					.string()
					.length(HEX_COLOR_LENGTH, "color must be a valid hex color (#RRGGBB)")
					.regex(
						/^#[0-9A-Fa-f]{6}$/,
						"color must be a valid hex color (#RRGGBB)",
					),
				icon: z.string().nullable().default(null),
			}),
		);
	}
}
