import type { Either } from "@/shared/domain/types/either";
import { success } from "@/shared/domain/types/either";
import type { UseCase } from "@/shared/domain/types/use-case";
import { AccountType } from "../entities/account-type.entity";
import { AccountTypeRepository } from "../repositories/account-type.repository";

export class ListAccountTypesUseCase implements UseCase<void, AccountType[]> {
	constructor(private readonly accountTypeRepository: AccountTypeRepository) {}

	async execute(): Promise<Either<unknown, AccountType[]>> {
		const accountTypes = await this.accountTypeRepository.findAll();
		return success(accountTypes);
	}
}
