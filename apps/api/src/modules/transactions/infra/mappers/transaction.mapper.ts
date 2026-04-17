import { Transaction, TransactionProps } from "../../domain";

export type TransactionRaw = {
	id: string;
	userId: string;
	accountId: string;
	title: string;
	amountCents: number;
	type: string;
	color: string;
	category: string | null | undefined;
	date: Date;
	createdAt: Date;
	updatedAt: Date;
};

// biome-ignore lint/complexity/noStaticOnlyClass: static utility class for mapping
export class TransactionMapper {
	static toDomain(raw: TransactionRaw): Transaction {
		const props: TransactionProps = {
			userId: raw.userId,
			accountId: raw.accountId,
			title: raw.title,
			amountCents: raw.amountCents,
			type: raw.type as TransactionProps["type"],
			color: raw.color,
			category: raw.category ?? null,
			date: raw.date,
			createdAt: raw.createdAt,
			updatedAt: raw.updatedAt,
		};
		return new Transaction(props, raw.id);
	}

	static toPersistence(entity: Transaction) {
		return {
			id: entity.id.toString(),
			userId: entity.userId,
			accountId: entity.accountId,
			title: entity.title,
			amountCents: entity.amountCents,
			type: entity.type,
			color: entity.color,
			category: entity.category,
			date: entity.date,
			createdAt: entity.createdAt,
			updatedAt: entity.updatedAt,
		};
	}

	static toResponse(entity: Transaction) {
		return {
			id: entity.id.toString(),
			userId: entity.userId,
			accountId: entity.accountId,
			title: entity.title,
			amountCents: entity.amountCents,
			type: entity.type,
			color: entity.color,
			category: entity.category,
			date: entity.date.toISOString(),
			createdAt: entity.createdAt.toISOString(),
			updatedAt: entity.updatedAt.toISOString(),
		};
	}
}
