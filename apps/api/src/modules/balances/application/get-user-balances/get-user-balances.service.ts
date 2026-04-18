import { Injectable } from "@nestjs/common";
import { BalanceRepository, GetUserBalancesUseCase } from "../../domain";

@Injectable()
export class GetUserBalancesService extends GetUserBalancesUseCase {
	constructor(balanceRepository: BalanceRepository) {
		super(balanceRepository);
	}
}
