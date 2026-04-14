import { Injectable } from "@nestjs/common";
import {
	BankAccountRepository,
	UpdateBankAccountUseCase,
} from "@/modules/bank-accounts/domain";

@Injectable()
export class UpdateBankAccountService extends UpdateBankAccountUseCase {
	constructor(bankAccountRepository: BankAccountRepository) {
		super(bankAccountRepository);
	}
}
