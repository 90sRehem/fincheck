import { Inject, Injectable } from "@nestjs/common";
import { and, eq, gte, lte, sql } from "drizzle-orm";
import type { DrizzleDB } from "@/core/database/connection";
import { DRIZZLE_DB } from "@/core/database/constants";
import {
	type ListTransactionsOptions,
	type PaginatedResult,
	Transaction,
	TransactionRepository,
} from "../../domain";
import { transactions } from "../drizzle/schemas/transaction-schema";
import { TransactionMapper } from "../mappers/transaction.mapper";

const ALLOWED_SORT_FIELDS = ["createdAt", "date", "amountCents", "title"];
const ALLOWLIST: Record<string, string> = {
	createdAt: "created_at",
	date: "date",
	amountCents: "amount_cents",
	title: "title",
};
const DEFAULT_SORT_FIELD = "created_at";
const JANUARY_MONTH = 0;
const DECEMBER_MONTH = 11;
const DAYS_IN_MONTH = 31;
const START_DAY = 1;
const DATE_HOURS = 23;
const DATE_MINUTES = 59;
const DATE_SECONDS = 59;
const DATE_MILLISECONDS = 999;

@Injectable()
export class DrizzleTransactionRepository extends TransactionRepository {
	constructor(@Inject(DRIZZLE_DB) private readonly db: DrizzleDB) {
		super();
	}

	async create(transaction: Transaction): Promise<Transaction> {
		const data = TransactionMapper.toPersistence(transaction);
		const [created] = await this.db
			.insert(transactions)
			.values(data)
			.returning();
		if (!created) throw new Error("Failed to create transaction");
		return TransactionMapper.toDomain(created);
	}

	async findById(id: string, userId: string): Promise<Transaction | null> {
		const [result] = await this.db
			.select()
			.from(transactions)
			.where(and(eq(transactions.id, id), eq(transactions.userId, userId)));
		if (!result) return null;
		return TransactionMapper.toDomain(result);
	}

	async findMany(
		options: ListTransactionsOptions,
	): Promise<PaginatedResult<Transaction>> {
		const {
			userId,
			filters,
			page = 1,
			limit = 10,
			sort = "createdAt",
			order = "desc",
		} = options;

		const whereConditions: Array<
			ReturnType<typeof eq> | ReturnType<typeof and>
		> = [eq(transactions.userId, userId)];

		if (filters?.accountId) {
			whereConditions.push(eq(transactions.accountId, filters.accountId));
		}

		if (filters?.type) {
			whereConditions.push(eq(transactions.type, filters.type));
		}

		if (filters?.year !== undefined || filters?.month !== undefined) {
			const year = filters.year;
			const month = filters.month;

			if (year !== undefined && month !== undefined) {
				const startDate = new Date(year, month - 1, START_DAY);
				const endDate = new Date(
					year,
					month,
					0,
					DATE_HOURS,
					DATE_MINUTES,
					DATE_SECONDS,
					DATE_MILLISECONDS,
				);
				whereConditions.push(
					and(
						gte(transactions.date, startDate),
						lte(transactions.date, endDate),
					),
				);
			} else if (year !== undefined) {
				const startDate = new Date(year, JANUARY_MONTH, START_DAY);
				const endDate = new Date(
					year,
					DECEMBER_MONTH,
					DAYS_IN_MONTH,
					DATE_HOURS,
					DATE_MINUTES,
					DATE_SECONDS,
					DATE_MILLISECONDS,
				);
				whereConditions.push(
					and(
						gte(transactions.date, startDate),
						lte(transactions.date, endDate),
					),
				);
			}
		}

		const offset = (page - 1) * limit;
		const sortField =
			ALLOWED_SORT_FIELDS.includes(sort) && ALLOWLIST[sort]
				? ALLOWLIST[sort]
				: DEFAULT_SORT_FIELD;
		const orderDirection = order === "asc" ? "ASC" : "DESC";

		const whereClause = and(...whereConditions);

		const [result] = await this.db
			.select({ count: sql<number>`count(*)` })
			.from(transactions)
			.where(whereClause);

		const totalCount = result?.count ?? 0;

		const rows = await this.db
			.select()
			.from(transactions)
			.where(whereClause)
			.orderBy(sql`${sql.identifier(sortField)} ${sql.raw(orderDirection)}`)
			.limit(limit)
			.offset(offset);

		const data = rows.map(TransactionMapper.toDomain);

		return {
			data,
			totalCount,
			page,
			limit,
			totalPages: Math.ceil(totalCount / limit),
		};
	}

	async update(transaction: Transaction): Promise<Transaction> {
		const data = TransactionMapper.toPersistence(transaction);
		const [updated] = await this.db
			.update(transactions)
			.set(data)
			.where(eq(transactions.id, transaction.id.toString()))
			.returning();
		if (!updated) throw new Error("Failed to update transaction");
		return TransactionMapper.toDomain(updated);
	}

	async delete(id: string, userId: string): Promise<void> {
		await this.db
			.delete(transactions)
			.where(and(eq(transactions.id, id), eq(transactions.userId, userId)));
	}
}
