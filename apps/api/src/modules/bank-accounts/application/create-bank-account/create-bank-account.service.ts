import { Injectable } from "@nestjs/common";
import {
	BankAccountRepository,
	CreateBankAccountUseCase,
} from "@/modules/bank-accounts/domain";

@Injectable()
export class CreateBankAccountService extends CreateBankAccountUseCase {
	constructor(bankAccountRepository: BankAccountRepository) {
		super(bankAccountRepository);
	}
}
