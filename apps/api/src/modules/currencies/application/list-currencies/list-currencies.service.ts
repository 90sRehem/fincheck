import { Injectable } from "@nestjs/common";
import { CurrencyRepository } from "../../domain/repositories/currency.repository";
import { ListCurrenciesUseCase } from "../../domain/use-cases/list-currencies.use-case";

@Injectable()
export class ListCurrenciesService extends ListCurrenciesUseCase {
	constructor(currencyRepository: CurrencyRepository) {
		super(currencyRepository);
	}
}
