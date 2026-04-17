import { NotFoundError } from "@/shared/domain/errors/not-found";
import { Either, failure, success } from "@/shared/domain/types/either";
import { UseCase } from "@/shared/domain/types/use-case";
import { TransactionRepository } from "../repositories/transaction.repository";

export interface RemoveTransactionUseCaseInput {
	id: string;
	userId: string;
}

export class RemoveTransactionUseCase
	implements UseCase<RemoveTransactionUseCaseInput, void>
{
	constructor(private readonly transactionRepository: TransactionRepository) {}

	async execute(
		input: RemoveTransactionUseCaseInput,
	): Promise<Either<NotFoundError, void>> {
		const existing = await this.transactionRepository.findById(
			input.id,
			input.userId,
		);

		if (!existing) {
			return failure(new NotFoundError("Transaction not found"));
		}

		await this.transactionRepository.delete(input.id, input.userId);

		return success(undefined);
	}
}
