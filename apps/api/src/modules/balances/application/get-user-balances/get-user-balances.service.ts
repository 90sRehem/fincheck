import { Injectable } from "@nestjs/common";
import { BalanceRepository, GetUserBalancesUseCase } from "../../domain";

@Injectable()
export class GetUserBalancesService extends GetUserBalancesUseCase {
	// biome-ignore lint/complexity/noUselessConstructor: NestJS DI requires explicit constructor for dependency injection
	constructor(balanceRepository: BalanceRepository) {
		super(balanceRepository);
	}
}
