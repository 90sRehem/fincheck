import { Module } from "@nestjs/common";
import { ListCurrenciesService } from "./application/list-currencies/list-currencies.service";
import { CurrencyRepository } from "./domain/repositories/currency.repository";
import { DrizzleCurrencyRepository } from "./infra/persistence/drizzle-currency.repository";
import { ListCurrenciesController } from "./presentation/list-currencies.controller";

@Module({
	controllers: [ListCurrenciesController],
	providers: [
		ListCurrenciesService,
		{
			provide: CurrencyRepository,
			useClass: DrizzleCurrencyRepository,
		},
	],
})
export class CurrenciesModule {}
