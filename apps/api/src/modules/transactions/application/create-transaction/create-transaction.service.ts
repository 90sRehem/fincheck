import { Injectable } from "@nestjs/common";
import { CreateTransactionUseCase } from "../../domain/use-cases/create-transaction.use-case";

@Injectable()
export class CreateTransactionService extends CreateTransactionUseCase {}
