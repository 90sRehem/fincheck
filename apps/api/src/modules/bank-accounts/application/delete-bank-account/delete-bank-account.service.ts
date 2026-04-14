import { Injectable } from "@nestjs/common";
import {
	BankAccountRepository,
	DeleteBankAccountUseCase,
} from "@/modules/bank-accounts/domain";

@Injectable()
export class DeleteBankAccountService extends DeleteBankAccountUseCase {
	constructor(bankAccountRepository: BankAccountRepository) {
		super(bankAccountRepository);
	}
}
