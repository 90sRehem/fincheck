import { NotFoundError } from "@/shared/domain/errors/not-found";
import { Either, failure, success } from "@/shared/domain/types/either";
import { UseCase } from "@/shared/domain/types/use-case";
import { BankAccountRepository } from "../../domain";

export interface DeleteBankAccountUseCaseInput {
	id: string;
	userId: string;
}

export class DeleteBankAccountUseCase
	implements UseCase<DeleteBankAccountUseCaseInput, void>
{
	constructor(private readonly bankAccountRepository: BankAccountRepository) {}

	async execute(
		input: DeleteBankAccountUseCaseInput,
	): Promise<Either<NotFoundError, void>> {
		const existing = await this.bankAccountRepository.findById(
			input.id,
			input.userId,
		);

		if (!existing) {
			return failure(new NotFoundError("Bank account not found"));
		}

		await this.bankAccountRepository.delete(input.id, input.userId);

		return success(undefined);
	}
}
