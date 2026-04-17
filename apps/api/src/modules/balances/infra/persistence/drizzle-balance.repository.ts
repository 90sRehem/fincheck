import { Inject, Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import type { DrizzleDB } from "@/core/database/connection";
import { DRIZZLE_DB } from "@/core/database/constants";
import { Balance, BalanceRepository } from "../../domain";
import { balances } from "../drizzle/schemas/balance-schema";
import { BalanceMapper } from "../mappers/balance.mapper";

@Injectable()
export class DrizzleBalanceRepository extends BalanceRepository {
	constructor(@Inject(DRIZZLE_DB) private readonly db: DrizzleDB) {
		super();
	}

	async create(balance: Balance): Promise<Balance> {
		const data = BalanceMapper.toPersistence(balance);
		const [created] = await this.db.insert(balances).values(data).returning();
		if (!created) throw new Error("Failed to create balance");
		return BalanceMapper.toDomain(created);
	}

	async findAllByUserId(userId: string): Promise<Balance[]> {
		const results = await this.db
			.select()
			.from(balances)
			.where(eq(balances.userId, userId));
		return results.map(BalanceMapper.toDomain);
	}
}
