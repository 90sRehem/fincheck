import { Either, failure, success } from "@/shared/domain/types/either";
import { UseCase } from "@/shared/domain/types/use-case";
import { ValidationFieldsError } from "@/shared/domain/validators/validation-fields-error";
import {
	BankAccount,
	BankAccountProps,
	BankAccountRepository,
} from "../../domain";

export interface CreateBankAccountUseCaseInput
	extends Omit<BankAccountProps, "currentBalance" | "icon"> {
	userId: string;
	icon?: string | null;
}

export class CreateBankAccountUseCase
	implements UseCase<CreateBankAccountUseCaseInput, BankAccount>
{
	constructor(private readonly bankAccountRepository: BankAccountRepository) {}

	async execute(
		input: CreateBankAccountUseCaseInput,
	): Promise<Either<ValidationFieldsError, BankAccount>> {
		const { userId, initialBalance, icon, name, type, currency, color } = input;

		const bankAccount = BankAccount.create(
			{
				userId,
				name,
				type,
				currency,
				color,
				initialBalance,
				currentBalance: initialBalance,
				icon: icon ?? null,
			},
			crypto.randomUUID(),
		);

		const validationResult = bankAccount.validate();

		if (validationResult.isFailure) {
			return failure(validationResult.value);
		}

		const created = await this.bankAccountRepository.create(bankAccount);

		return success(created);
	}
}
