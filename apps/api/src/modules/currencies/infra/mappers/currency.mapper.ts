import { Currency } from "../../domain/entities/currency.entity";

export interface CurrencyRaw {
	id: string;
	code: string;
	name: string;
}

export interface CurrencyResponse {
	id: string;
	code: string;
	name: string;
}

// biome-ignore lint/complexity/noStaticOnlyClass: mapper segue padrão estático do projeto
export class CurrencyMapper {
	static toDomain(raw: CurrencyRaw): Currency {
		return new Currency(raw.id, raw.code, raw.name);
	}

	static toResponse(entity: Currency): CurrencyResponse {
		return {
			id: entity.id,
			code: entity.code,
			name: entity.name,
		};
	}
}
