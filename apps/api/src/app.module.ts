import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./core/auth";
import { DatabaseModule } from "./core/database";
import { EnvModule, envSchema } from "./core/env";
import { EventsModule } from "./core/events/events.module";
import { BalancesModule } from "./modules/balances/balances.module";
import { BankAccountsModule } from "./modules/bank-accounts/bank-accounts.module";
import { CategoriesModule } from "./modules/categories/categories.module";
import { ColorsModule } from "./modules/colors/colors.module";
import { CurrenciesModule } from "./modules/currencies/currencies.module";
import { TransactionsModule } from "./modules/transactions/transactions.module";

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			validate: (env) => envSchema.parse(env),
		}),
		EnvModule,
		DatabaseModule,
		EventsModule,
		AuthModule,
		BankAccountsModule,
		TransactionsModule,
		BalancesModule,
		ColorsModule,
		CurrenciesModule,
		CategoriesModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
