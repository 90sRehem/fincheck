import { Injectable } from "@nestjs/common";
import { UpdateTransactionUseCase } from "../../domain/use-cases/update-transaction.use-case";

@Injectable()
export class UpdateTransactionService extends UpdateTransactionUseCase {}
