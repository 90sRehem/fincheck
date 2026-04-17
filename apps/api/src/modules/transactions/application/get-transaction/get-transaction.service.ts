import { Injectable } from "@nestjs/common";
import { GetTransactionUseCase } from "../../domain/use-cases/get-transaction.use-case";

@Injectable()
export class GetTransactionService extends GetTransactionUseCase {}
