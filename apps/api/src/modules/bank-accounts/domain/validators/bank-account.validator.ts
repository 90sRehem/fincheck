import { z } from "zod";
import { ZodValidationStrategy } from "@/shared/domain/validators/zod-validation-strategy";
import { AccountType } from "../entities/account-type.entity";
import { Color } from "../entities/color.entity";
import { Currency } from "../entities/currency.entity";

const NAME_MAX_LENGTH = 100;

export interface BankAccountProps {
	userId: string;
	name: string;
	accountType: AccountType;
	initialBalance: number;
	currency: Currency;
	color: Color;
	icon: string | null;
	createdAt: Date;
	updatedAt: Date;
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
				accountType: z.instanceof(AccountType, {
					message: "accountType must be an AccountType instance",
				}),
				initialBalance: z.number(),
				currency: z.instanceof(Currency, {
					message: "currency must be a Currency instance",
				}),
				color: z.instanceof(Color, {
					message: "color must be a Color instance",
				}),
				icon: z.string().nullable().default(null),
				createdAt: z.date(),
				updatedAt: z.date(),
			}),
		);
	}
}
