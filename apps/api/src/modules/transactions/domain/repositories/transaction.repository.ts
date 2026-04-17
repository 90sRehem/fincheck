import { Transaction } from "../entities/transaction.entity";
import type { TransactionType } from "../value-objects/transaction-type";

export interface ListTransactionsFilters {
	accountId?: string;
	year?: number;
	month?: number;
	type?: TransactionType;
}

export interface ListTransactionsOptions {
	userId: string;
	filters?: ListTransactionsFilters;
	page?: number;
	limit?: number;
	sort?: string;
	order?: "asc" | "desc";
}

export interface PaginatedResult<T> {
	data: T[];
	totalCount: number;
	page: number;
	limit: number;
	totalPages: number;
}

export abstract class TransactionRepository {
	abstract create(transaction: Transaction): Promise<Transaction>;
	abstract findById(id: string, userId: string): Promise<Transaction | null>;
	abstract findMany(
		options: ListTransactionsOptions,
	): Promise<PaginatedResult<Transaction>>;
	abstract update(transaction: Transaction): Promise<Transaction>;
	abstract delete(id: string, userId: string): Promise<void>;
}
