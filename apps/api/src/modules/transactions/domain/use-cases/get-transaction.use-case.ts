import { NotFoundError } from "@/shared/domain/errors";
import { Either, failure, success } from "@/shared/domain/types/either";
import { UseCase } from "@/shared/domain/types/use-case";
import { Transaction } from "../entities/transaction.entity";
import { TransactionRepository } from "../repositories/transaction.repository";

export interface GetTransactionUseCaseInput {
	id: string;
	userId: string;
}

export class GetTransactionUseCase
	implements UseCase<GetTransactionUseCaseInput, Transaction>
{
	constructor(private readonly transactionRepository: TransactionRepository) {}

	async execute(
		input: GetTransactionUseCaseInput,
	): Promise<Either<NotFoundError, Transaction>> {
		const { id, userId } = input;

		const transaction = await this.transactionRepository.findById(id, userId);

		if (!transaction) {
			return failure(new NotFoundError("Transaction not found"));
		}

		return success(transaction);
	}
}
