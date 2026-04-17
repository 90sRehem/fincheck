import { z } from "zod";
import { ZodValidationStrategy } from "@/shared/domain/validators/zod-validation-strategy";
import type { BalanceProps } from "../entities/balance.entity";

const CURRENCY_LENGTH = 3;

export class BalanceValidator extends ZodValidationStrategy<BalanceProps> {
	constructor() {
		super(
			z.object({
				userId: z.uuid({ message: "userId must be a valid UUID" }),
				bankAccountId: z.uuid({
					message: "bankAccountId must be a valid UUID",
				}),
				amountCents: z
					.number()
					.int({ message: "amountCents must be an integer" }),
				currency: z
					.string()
					.length(
						CURRENCY_LENGTH,
						`currency must be exactly ${CURRENCY_LENGTH} characters`,
					),
			}),
		);
	}
}
