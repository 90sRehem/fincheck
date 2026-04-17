import { Injectable } from "@nestjs/common";
import { ListTransactionsUseCase } from "../../domain/use-cases/list-transactions.use-case";

@Injectable()
export class ListTransactionsService extends ListTransactionsUseCase {}
