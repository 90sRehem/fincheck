import { Inject, Injectable } from "@nestjs/common";
import type { DrizzleDB } from "@/core/database";
import { DRIZZLE_DB } from "@/core/database/constants";
import { Currency } from "../../domain/entities/currency.entity";
import { CurrencyRepository } from "../../domain/repositories/currency.repository";
import { currencies } from "../drizzle/schemas/currency-schema";
import { CurrencyMapper } from "../mappers/currency.mapper";

@Injectable()
export class DrizzleCurrencyRepository extends CurrencyRepository {
	constructor(@Inject(DRIZZLE_DB) private readonly db: DrizzleDB) {
		super();
	}

	async findAll(): Promise<Currency[]> {
		const currenciesData = await this.db.select().from(currencies);
		return currenciesData.map((raw) => CurrencyMapper.toDomain(raw));
	}
}
