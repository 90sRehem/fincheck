import { Currency } from "../../domain/entities/currency.entity";

// biome-ignore lint/complexity/noStaticOnlyClass: mapper pattern
export class CurrencyMapper {
	static toDomain(raw: { id: string; code: string; name: string }) {
		return new Currency(raw.id, raw.code, raw.name);
	}

	static toResponse(entity: Currency) {
		return {
			id: entity.id,
			code: entity.code,
			name: entity.name,
		};
	}
}
