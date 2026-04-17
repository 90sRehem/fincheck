import type { Balance } from "../entities/balance.entity";

export abstract class BalanceRepository {
	abstract create(balance: Balance): Promise<Balance>;
	abstract findAllByUserId(userId: string): Promise<Balance[]>;
}
