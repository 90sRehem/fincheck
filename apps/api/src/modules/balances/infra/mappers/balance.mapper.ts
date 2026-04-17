import { Balance } from "../../domain";

export type BalanceRaw = {
	id: string;
	userId: string;
	bankAccountId: string;
	amountCents: number;
	currency: string;
	updatedAt: Date;
};

// biome-ignore lint/complexity/noStaticOnlyClass: mapper pattern requires static-only class
export class BalanceMapper {
	static toDomain(raw: BalanceRaw): Balance {
		return new Balance(
			{
				userId: raw.userId,
				bankAccountId: raw.bankAccountId,
				amountCents: raw.amountCents,
				currency: raw.currency,
				createdAt: new Date(),
				updatedAt: raw.updatedAt,
			},
			raw.id,
		);
	}

	static toPersistence(entity: Balance) {
		return {
			id: entity.id.toString(),
			userId: entity.userId,
			bankAccountId: entity.bankAccountId,
			amountCents: entity.amountCents,
			currency: entity.currency,
			updatedAt: entity.updatedAt,
		};
	}
}
