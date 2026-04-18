import { Injectable } from "@nestjs/common";
import { AccountTypeRepository, ListAccountTypesUseCase } from "../../domain";

@Injectable()
export class ListAccountTypesService extends ListAccountTypesUseCase {
	// biome-ignore lint/complexity/noUselessConstructor: NestJS DI requires explicit constructor for dependency injection
	constructor(accountTypeRepository: AccountTypeRepository) {
		super(accountTypeRepository);
	}
}
