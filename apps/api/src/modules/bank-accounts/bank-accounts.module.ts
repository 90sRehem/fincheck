import { Module } from "@nestjs/common";
import { CreateBankAccountService } from "./application/create-bank-account/create-bank-account.service";
import { DeleteBankAccountService } from "./application/delete-bank-account/delete-bank-account.service";
import { ListAccountTypesService } from "./application/list-account-types/list-account-types.service";
import { ListBankAccountsService } from "./application/list-bank-accounts/list-bank-accounts.service";
import { UpdateBankAccountService } from "./application/update-bank-account/update-bank-account.service";
import {
	AccountTypeRepository,
	BankAccountRepository,
	ColorRepository,
	CurrencyRepository,
} from "./domain";
import { DrizzleAccountTypeRepository } from "./infra/persistence/drizzle-account-type.repository";
import { DrizzleBankAccountRepository } from "./infra/persistence/drizzle-bank-account.repository";
import { DrizzleColorRepository } from "./infra/persistence/drizzle-color.repository";
import { DrizzleCurrencyRepository } from "./infra/persistence/drizzle-currency.repository";
import { CreateBankAccountController } from "./presentation/create-bank-account.controller";
import { DeleteBankAccountController } from "./presentation/delete-bank-account.controller";
import { ListAccountTypesController } from "./presentation/list-account-types.controller";
import { ListBankAccountsController } from "./presentation/list-bank-accounts.controller";
import { UpdateBankAccountController } from "./presentation/update-bank-account.controller";

@Module({
	controllers: [
		CreateBankAccountController,
		ListAccountTypesController,
		ListBankAccountsController,
		UpdateBankAccountController,
		DeleteBankAccountController,
	],
	providers: [
		{
			provide: BankAccountRepository,
			useClass: DrizzleBankAccountRepository,
		},
		{
			provide: AccountTypeRepository,
			useClass: DrizzleAccountTypeRepository,
		},
		{
			provide: ColorRepository,
			useClass: DrizzleColorRepository,
		},
		{
			provide: CurrencyRepository,
			useClass: DrizzleCurrencyRepository,
		},
		CreateBankAccountService,
		ListBankAccountsService,
		ListAccountTypesService,
		UpdateBankAccountService,
		DeleteBankAccountService,
	],
	exports: [BankAccountRepository],
})
export class BankAccountsModule {}
