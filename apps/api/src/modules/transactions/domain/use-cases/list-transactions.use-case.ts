import { Either, success } from "@/shared/domain/types/either";
import { UseCase } from "@/shared/domain/types/use-case";
import { Transaction } from "../entities/transaction.entity";
import {
	ListTransactionsFilters,
	PaginatedResult,
	TransactionRepository,
} from "../repositories/transaction.repository";

export interface ListTransactionsUseCaseInput {
	userId: string;
	filters?: ListTransactionsFilters;
	page?: number;
	limit?: number;
	sort?: string;
	order?: "asc" | "desc";
}

export class ListTransactionsUseCase
	implements UseCase<ListTransactionsUseCaseInput, PaginatedResult<Transaction>>
{
	constructor(private readonly transactionRepository: TransactionRepository) {}

	async execute(
		input: ListTransactionsUseCaseInput,
	): Promise<Either<unknown, PaginatedResult<Transaction>>> {
		const {
			userId,
			filters,
			page = 1,
			limit = 10,
			sort = "createdAt",
			order = "desc",
		} = input;

		const result = await this.transactionRepository.findMany({
			userId,
			filters,
			page,
			limit,
			sort,
			order,
		});

		return success(result);
	}
}
