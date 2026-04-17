import { Module } from "@nestjs/common";
import { GetUserBalancesService } from "./application/get-user-balances/get-user-balances.service";
import { OnBankAccountCreatedListener } from "./application/on-bank-account-created/on-bank-account-created.listener";
import { BalanceRepository } from "./domain";
import { DrizzleBalanceRepository } from "./infra/persistence/drizzle-balance.repository";
import { GetUserBalancesController } from "./presentation/get-user-balances.controller";

@Module({
	controllers: [GetUserBalancesController],
	providers: [
		{ provide: BalanceRepository, useClass: DrizzleBalanceRepository },
		GetUserBalancesService,
		OnBankAccountCreatedListener,
	],
})
export class BalancesModule {}
