import { Inject, Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import type { DrizzleDB } from "@/core/database";
import { DRIZZLE_DB } from "@/core/database/constants";
import { currencies } from "../../../currencies/infra/drizzle/schemas/currency-schema";
import { Currency } from "../../domain/entities/currency.entity";
import { CurrencyRepository } from "../../domain/repositories/currency.repository";
import { CurrencyMapper } from "../mappers/currency.mapper";

@Injectable()
export class DrizzleCurrencyRepository extends CurrencyRepository {
	constructor(@Inject(DRIZZLE_DB) private readonly db: DrizzleDB) {
		super();
	}

	async findById(id: string): Promise<Currency | null> {
		const result = await this.db
			.select()
			.from(currencies)
			.where(eq(currencies.id, id));
		if (result.length === 0) return null;
		const currency = result[0];
		if (!currency) return null;
		return CurrencyMapper.toDomain(currency);
	}

	async findAll(): Promise<Currency[]> {
		const results = await this.db.select().from(currencies);
		return results.map((raw) => CurrencyMapper.toDomain(raw));
	}
}
