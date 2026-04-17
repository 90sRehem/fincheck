import { Injectable } from "@nestjs/common";
import { RemoveTransactionUseCase } from "../../domain/use-cases/remove-transaction.use-case";

@Injectable()
export class RemoveTransactionService extends RemoveTransactionUseCase {}
