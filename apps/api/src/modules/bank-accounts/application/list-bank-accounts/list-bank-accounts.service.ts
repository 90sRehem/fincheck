import { Injectable } from "@nestjs/common";
import {
	BankAccountRepository,
	ListBankAccountsUseCase,
} from "@/modules/bank-accounts/domain";

@Injectable()
export class ListBankAccountsService extends ListBankAccountsUseCase {
	constructor(bankAccountRepository: BankAccountRepository) {
		super(bankAccountRepository);
	}
}
