import { success } from "@/shared/domain/types/either";
import type { UseCase } from "@/shared/domain/types/use-case";
import { BalanceRepository } from "../repositories/balance.repository";

export interface GetUserBalancesInput {
	userId: string;
}

export interface AggregatedBalance {
	amountCents: number;
	currency: string;
}

export class GetUserBalancesUseCase
	implements UseCase<GetUserBalancesInput, AggregatedBalance[]>
{
	constructor(private readonly balanceRepository: BalanceRepository) {}

	async execute(input: GetUserBalancesInput) {
		const { userId } = input;

		const rows = await this.balanceRepository.findAllByUserId(userId);

		const aggregated = rows.reduce<Record<string, number>>((acc, balance) => {
			const { currency, amountCents } = balance;
			acc[currency] = (acc[currency] ?? 0) + amountCents;
			return acc;
		}, {});

		const result: AggregatedBalance[] = Object.entries(aggregated).map(
			([currency, amountCents]) => ({ currency, amountCents }),
		);

		return success(result);
	}
}
