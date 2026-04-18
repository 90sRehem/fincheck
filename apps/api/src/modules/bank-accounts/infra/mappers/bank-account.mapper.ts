import { BankAccount, BankAccountProps } from "../../domain";
import { AccountType } from "../../domain/entities/account-type.entity";
import { Color } from "../../domain/entities/color.entity";
import { Currency } from "../../domain/entities/currency.entity";

export interface ColorData {
	id: string;
	name: string;
	hex: string;
}

export interface AccountTypeData {
	id: string;
	name: string;
}

export interface CurrencyData {
	id: string;
	code: string;
	name: string;
}

export type BankAccountRaw = {
	id: string;
	userId: string;
	name: string;
	accountTypeId: string;
	initialBalance: string;
	currencyId: string;
	colorId: string;
	icon: string | null | undefined;
	createdAt: Date;
	updatedAt: Date;
	color?: ColorData;
	accountType?: AccountTypeData;
	currency?: CurrencyData;
};

// biome-ignore lint/complexity/noStaticOnlyClass: mapper segue padrão estático do projeto
export class BankAccountMapper {
	static toDomain(raw: BankAccountRaw): BankAccount {
		const props: BankAccountProps = {
			userId: raw.userId,
			name: raw.name,
			accountType: new AccountType(
				raw.accountTypeId,
				raw.accountType?.name ?? "Unknown",
			),
			initialBalance: parseFloat(raw.initialBalance),
			currency: new Currency(
				raw.currencyId,
				raw.currency?.code ?? "BRL",
				raw.currency?.name ?? "Real Brasileiro",
			),
			color: new Color(
				raw.colorId,
				raw.color?.name ?? "gray",
				raw.color?.hex ?? "#9CA3AF",
			),
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
			accountTypeId: entity.accountType.id,
			initialBalance: entity.initialBalance.toString(),
			currencyId: entity.currency.id,
			colorId: entity.color.id,
			icon: entity.icon,
			createdAt: entity.createdAt,
			updatedAt: entity.updatedAt,
		};
	}

	static toResponse(entity: BankAccount) {
		return {
			id: entity.id.toString(),
			name: entity.name,
			accountType: {
				id: entity.accountType.id,
				name: entity.accountType.name,
			},
			initialBalance: entity.initialBalance,
			currency: {
				id: entity.currency.id,
				code: entity.currency.code,
				name: entity.currency.name,
			},
			color: {
				id: entity.color.id,
				name: entity.color.name,
				hex: entity.color.hex,
			},
			icon: entity.icon,
			createdAt: entity.createdAt.toISOString(),
			updatedAt: entity.updatedAt.toISOString(),
		};
	}
}
