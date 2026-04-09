import { Controller, Get } from "@nestjs/common";
import { Session } from "@thallesp/nestjs-better-auth";
import { BankAccount, ListBankAccountsUseCase } from "../domain";
import { BankAccountMapper } from "../infra/mappers/bank-account.mapper";

@Controller("bank-accounts")
export class ListBankAccountsController {
	constructor(
		private readonly listBankAccountsUseCase: ListBankAccountsUseCase,
	) {}

	@Get()
	async list(@Session() session: { userId: string }) {
		const result = await this.listBankAccountsUseCase.execute({
			userId: session.userId,
		});

		const accounts = result.value as BankAccount[];
		return accounts.map(BankAccountMapper.toResponse);
	}
}
