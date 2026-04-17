import { Module } from "@nestjs/common";
import { CreateBankAccountService } from "./application/create-bank-account/create-bank-account.service";
import { DeleteBankAccountService } from "./application/delete-bank-account/delete-bank-account.service";
import { ListBankAccountsService } from "./application/list-bank-accounts/list-bank-accounts.service";
import { UpdateBankAccountService } from "./application/update-bank-account/update-bank-account.service";
import { BankAccountRepository } from "./domain";
import { DrizzleBankAccountRepository } from "./infra/persistence/drizzle-bank-account.repository";
import { CreateBankAccountController } from "./presentation/create-bank-account.controller";
import { DeleteBankAccountController } from "./presentation/delete-bank-account.controller";
import { ListBankAccountsController } from "./presentation/list-bank-accounts.controller";
import { UpdateBankAccountController } from "./presentation/update-bank-account.controller";

@Module({
	controllers: [
		CreateBankAccountController,
		ListBankAccountsController,
		UpdateBankAccountController,
		DeleteBankAccountController,
	],
	providers: [
		{
			provide: BankAccountRepository,
			useClass: DrizzleBankAccountRepository,
		},
		CreateBankAccountService,
		ListBankAccountsService,
		UpdateBankAccountService,
		DeleteBankAccountService,
	],
	exports: [BankAccountRepository],
})
export class BankAccountsModule {}
