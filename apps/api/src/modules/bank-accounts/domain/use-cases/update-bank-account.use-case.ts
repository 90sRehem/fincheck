import { NotFoundError } from "@/shared/domain/errors/not-found";
import { Either, failure, success } from "@/shared/domain/types/either";
import { UseCase } from "@/shared/domain/types/use-case";
import { ValidationFieldsError } from "@/shared/domain/validators/validation-fields-error";
import { BankAccount, BankAccountRepository } from "../../domain";

export interface UpdateBankAccountUseCaseInput {
	id: string;
	userId: string;
	data: Partial<
		Pick<BankAccount, "name" | "type" | "currency" | "color" | "icon">
	>;
}

export class UpdateBankAccountUseCase
	implements UseCase<UpdateBankAccountUseCaseInput, BankAccount>
{
	constructor(private readonly bankAccountRepository: BankAccountRepository) {}

	async execute(
		input: UpdateBankAccountUseCaseInput,
	): Promise<Either<NotFoundError | ValidationFieldsError, BankAccount>> {
		const existing = await this.bankAccountRepository.findById(
			input.id,
			input.userId,
		);

		if (!existing) {
			return failure(new NotFoundError("Bank account not found"));
		}

		existing.update(input.data);

		const validationResult = existing.validate();

		if (validationResult.isFailure) {
			return failure(validationResult.value);
		}

		const updated = await this.bankAccountRepository.update(existing);

		return success(updated);
	}
}
