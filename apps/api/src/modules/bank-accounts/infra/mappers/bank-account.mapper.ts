import { BankAccount, BankAccountProps } from "../../domain";

export type BankAccountRaw = {
	id: string;
	userId: string;
	name: string;
	type: string;
	initialBalance: string;
	currentBalance: string;
	currency: string;
	color: string;
	icon: string | null | undefined;
	createdAt: Date;
	updatedAt: Date;
};

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class BankAccountMapper {
	static toDomain(raw: BankAccountRaw): BankAccount {
		const props: BankAccountProps = {
			userId: raw.userId,
			name: raw.name,
			type: raw.type as BankAccountProps["type"],
			initialBalance: parseFloat(raw.initialBalance),
			currentBalance: parseFloat(raw.currentBalance),
			currency: raw.currency,
			color: raw.color,
			icon: raw.icon ?? null,
			createdAt: raw.createdAt,
			updatedAt: raw.updatedAt,
		};
		return new BankAccount(props, raw.id);
	}

	static toPersistence(entity: BankAccount) {
		return {
			id: entity.id.toString(),
			userId: entity.userId,
			name: entity.name,
			type: entity.type,
			initialBalance: entity.initialBalance.toString(),
			currentBalance: entity.currentBalance.toString(),
			currency: entity.currency,
			color: entity.color,
			icon: entity.icon,
			createdAt: entity.createdAt,
			updatedAt: entity.updatedAt,
		};
	}

	static toResponse(entity: BankAccount) {
		return {
			id: entity.id.toString(),
			name: entity.name,
			type: entity.type,
			initialBalance: entity.initialBalance,
			currentBalance: entity.currentBalance,
			currency: entity.currency,
			color: entity.color,
			icon: entity.icon,
			createdAt: entity.createdAt.toISOString(),
			updatedAt: entity.updatedAt.toISOString(),
		};
	}
}
