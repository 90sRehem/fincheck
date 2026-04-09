import { Module } from "@nestjs/common";
import { CreateBankAccountController } from "./create-bank-account/create-bank-account.controller";
import { DeleteBankAccountController } from "./delete-bank-account/delete-bank-account.controller";
import {
	BankAccountRepository,
	CreateBankAccountUseCase,
	DeleteBankAccountUseCase,
	ListBankAccountsUseCase,
	UpdateBankAccountUseCase,
} from "./domain";
import { DrizzleBankAccountRepository } from "./infra/persistence/drizzle-bank-account.repository";
import { ListBankAccountsController } from "./list-bank-accounts/list-bank-accounts.controller";
import { UpdateBankAccountController } from "./update-bank-account/update-bank-account.controller";

@Module({
	controllers: [
		CreateBankAccountController,
		ListBankAccountsController,
		UpdateBankAccountController,
		DeleteBankAccountController,
	],
	providers: [
		CreateBankAccountUseCase,
		ListBankAccountsUseCase,
		UpdateBankAccountUseCase,
		DeleteBankAccountUseCase,
		{
			provide: BankAccountRepository,
			useClass: DrizzleBankAccountRepository,
		},
	],
	exports: [BankAccountRepository],
})
export class BankAccountsModule {}
