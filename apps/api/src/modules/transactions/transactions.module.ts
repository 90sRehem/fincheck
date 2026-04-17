import { Module } from "@nestjs/common";
import { CreateTransactionService } from "./application/create-transaction/create-transaction.service";
import { GetTransactionService } from "./application/get-transaction/get-transaction.service";
import { ListTransactionsService } from "./application/list-transactions/list-transactions.service";
import { RemoveTransactionService } from "./application/remove-transaction/remove-transaction.service";
import { UpdateTransactionService } from "./application/update-transaction/update-transaction.service";
import { TransactionRepository } from "./domain/repositories/transaction.repository";
import { DrizzleTransactionRepository } from "./infra/persistence/drizzle-transaction.repository";
import { TransactionsController } from "./presentation/transactions.controller";

@Module({
	controllers: [TransactionsController],
	providers: [
		{
			provide: TransactionRepository,
			useClass: DrizzleTransactionRepository,
		},
		CreateTransactionService,
		GetTransactionService,
		ListTransactionsService,
		UpdateTransactionService,
		RemoveTransactionService,
	],
	exports: [TransactionRepository],
})
export class TransactionsModule {}
