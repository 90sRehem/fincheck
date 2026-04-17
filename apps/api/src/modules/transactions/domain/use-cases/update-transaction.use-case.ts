import { NotFoundError } from "@/shared/domain/errors/not-found";
import { Either, failure, success } from "@/shared/domain/types/either";
import { UseCase } from "@/shared/domain/types/use-case";
import { ValidationFieldsError } from "@/shared/domain/validators/validation-fields-error";
import { Transaction, TransactionProps } from "../entities/transaction.entity";
import { TransactionRepository } from "../repositories/transaction.repository";

export interface UpdateTransactionUseCaseInput {
	id: string;
	userId: string;
	data: Partial<Omit<TransactionProps, "userId">>;
}

export class UpdateTransactionUseCase
	implements UseCase<UpdateTransactionUseCaseInput, Transaction>
{
	constructor(private readonly transactionRepository: TransactionRepository) {}

	async execute(
		input: UpdateTransactionUseCaseInput,
	): Promise<Either<NotFoundError | ValidationFieldsError, Transaction>> {
		const existing = await this.transactionRepository.findById(
			input.id,
			input.userId,
		);

		if (!existing) {
			return failure(new NotFoundError("Transaction not found"));
		}

		existing.update(input.data);

		const validationResult = existing.validate();

		if (validationResult.isFailure) {
			return failure(validationResult.value);
		}

		const updated = await this.transactionRepository.update(existing);

		return success(updated);
	}
}
