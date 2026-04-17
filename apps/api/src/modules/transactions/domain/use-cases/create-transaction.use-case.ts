import { Either, failure, success } from "@/shared/domain/types/either";
import { UseCase } from "@/shared/domain/types/use-case";
import { ValidationFieldsError } from "@/shared/domain/validators/validation-fields-error";
import { Transaction, TransactionProps } from "../entities/transaction.entity";
import { TransactionRepository } from "../repositories/transaction.repository";

export interface CreateTransactionUseCaseInput
	extends Omit<TransactionProps, "date" | "createdAt" | "updatedAt"> {
	date: string;
}

export class CreateTransactionUseCase
	implements UseCase<CreateTransactionUseCaseInput, Transaction>
{
	constructor(private readonly transactionRepository: TransactionRepository) {}

	async execute(
		input: CreateTransactionUseCaseInput,
	): Promise<Either<ValidationFieldsError, Transaction>> {
		const {
			userId,
			accountId,
			title,
			amountCents,
			type,
			color,
			category,
			date,
		} = input;

		const transaction = new Transaction(
			{
				userId,
				accountId,
				title,
				amountCents,
				type,
				color,
				category: category ?? null,
				date: new Date(date),
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			crypto.randomUUID(),
		);

		const validationResult = transaction.validate();

		if (validationResult.isFailure) {
			return failure(validationResult.value);
		}

		await this.transactionRepository.create(transaction);

		return success(transaction);
	}
}
