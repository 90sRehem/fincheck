import { Either, success } from "@/shared/domain/types/either";
import { UseCase } from "@/shared/domain/types/use-case";
import { BankAccount, BankAccountRepository } from "../../domain";

export interface ListBankAccountsUseCaseInput {
	userId: string;
}

export class ListBankAccountsUseCase
	implements UseCase<ListBankAccountsUseCaseInput, BankAccount[]>
{
	constructor(private readonly bankAccountRepository: BankAccountRepository) {}

	async execute(
		input: ListBankAccountsUseCaseInput,
	): Promise<Either<unknown, BankAccount[]>> {
		const accounts = await this.bankAccountRepository.findAllByUserId(
			input.userId,
		);
		return success(accounts);
	}
}
