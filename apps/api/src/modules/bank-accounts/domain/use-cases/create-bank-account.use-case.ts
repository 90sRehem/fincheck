import { BankAccountCreatedEvent } from "@/shared/domain/events";
import { Either, failure, success } from "@/shared/domain/types/either";
import { UseCase } from "@/shared/domain/types/use-case";
import { ValidationFieldsError } from "@/shared/domain/validators/validation-fields-error";
import { BankAccount, BankAccountRepository } from "../../domain";
import { AccountType } from "../../domain/entities/account-type.entity";
import { Color } from "../../domain/entities/color.entity";
import { Currency } from "../../domain/entities/currency.entity";

export interface CreateBankAccountUseCaseInput {
	userId: string;
	name: string;
	accountType: AccountType;
	initialBalance: number;
	currency: Currency;
	color: Color;
	icon?: string | null;
}

export class CreateBankAccountUseCase
	implements UseCase<CreateBankAccountUseCaseInput, BankAccount>
{
	constructor(private readonly bankAccountRepository: BankAccountRepository) {}

	async execute(
		input: CreateBankAccountUseCaseInput,
	): Promise<Either<ValidationFieldsError, BankAccount>> {
		const { userId, initialBalance, icon, name, accountType, currency, color } =
			input;

		// Entidades já são passadas resolvidas pelo service
		const bankAccount = new BankAccount(
			{
				userId,
				name,
				accountType,
				currency,
				color,
				initialBalance,
				icon: icon ?? null,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			crypto.randomUUID(),
		);

		const validationResult = bankAccount.validate();

		if (validationResult.isFailure) {
			return failure(validationResult.value);
		}

		bankAccount.addDomainEvent(
			new BankAccountCreatedEvent(
				bankAccount.id,
				userId,
				initialBalance,
				currency.id,
			),
		);

		const created = await this.bankAccountRepository.create(bankAccount);

		return success(created);
	}
}
