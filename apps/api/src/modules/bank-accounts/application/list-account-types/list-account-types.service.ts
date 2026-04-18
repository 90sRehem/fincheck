import { Injectable } from "@nestjs/common";
import { AccountTypeRepository, ListAccountTypesUseCase } from "../../domain";

@Injectable()
export class ListAccountTypesService extends ListAccountTypesUseCase {}
