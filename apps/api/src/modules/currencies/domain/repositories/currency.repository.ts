import { Currency } from "../entities/currency.entity";

export abstract class CurrencyRepository {
	abstract findAll(): Promise<Currency[]>;
}
