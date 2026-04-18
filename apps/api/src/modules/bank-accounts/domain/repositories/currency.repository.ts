import { Currency } from "../entities/currency.entity";

export abstract class CurrencyRepository {
	abstract findById(id: string): Promise<Currency | null>;
	abstract findAll(): Promise<Currency[]>;
}
