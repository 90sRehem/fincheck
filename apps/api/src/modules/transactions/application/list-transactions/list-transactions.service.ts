import { Injectable } from "@nestjs/common";
import { TransactionRepository } from "../../domain";
import { ListTransactionsUseCase } from "../../domain/use-cases/list-transactions.use-case";

@Injectable()
export class ListTransactionsService extends ListTransactionsUseCase {
	constructor(repository: TransactionRepository) {
		super(repository);
	}
}
