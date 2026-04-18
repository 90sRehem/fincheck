import { Either, success } from "@/shared/domain";
import { Currency } from "../entities/currency.entity";
import { CurrencyRepository } from "../repositories/currency.repository";

export class ListCurrenciesUseCase {
	constructor(private readonly currencyRepository: CurrencyRepository) {}

	async execute(): Promise<Either<unknown, Currency[]>> {
		const currencies = await this.currencyRepository.findAll();
		return success(currencies);
	}
}
