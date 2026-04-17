import { Injectable } from "@nestjs/common";
import {
	BankAccountRepository,
	CreateBankAccountUseCase,
} from "@/modules/bank-accounts/domain";
import { DomainEventDispatcher } from "@/shared/domain/events";
import type { CreateBankAccountUseCaseInput } from "../../domain/use-cases/create-bank-account.use-case";

@Injectable()
export class CreateBankAccountService extends CreateBankAccountUseCase {
	private readonly dispatcher: DomainEventDispatcher;

	constructor(
		bankAccountRepository: BankAccountRepository,
		dispatcher: DomainEventDispatcher,
	) {
		super(bankAccountRepository);
		this.dispatcher = dispatcher;
	}

	override async execute(input: CreateBankAccountUseCaseInput) {
		const result = await super.execute(input);

		if (result.isSuccess) {
			await this.dispatcher.dispatchAll(result.value);
		}

		return result;
	}
}
