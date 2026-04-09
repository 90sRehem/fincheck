import { Inject, Injectable } from "@nestjs/common";
import { and, eq } from "drizzle-orm";
import type { DrizzleDB } from "@/core/database/connection";
import { DRIZZLE_DB } from "@/core/database/constants";
import { BankAccount, BankAccountRepository } from "../../domain";
import { bankAccounts } from "../../infra/drizzle/schemas/bank-account-schema";
import { BankAccountMapper } from "../mappers/bank-account.mapper";

@Injectable()
export class DrizzleBankAccountRepository extends BankAccountRepository {
	constructor(@Inject(DRIZZLE_DB) private readonly db: DrizzleDB) {
		super();
	}

	async create(bankAccount: BankAccount): Promise<BankAccount> {
		const data = BankAccountMapper.toPersistence(bankAccount);
		const [created] = await this.db.insert(bankAccounts).values(data).returning();
		if (!created) throw new Error("Failed to create bank account");
		return BankAccountMapper.toDomain(created);
	}

	async findById(id: string, userId: string): Promise<BankAccount | null> {
		const [result] = await this.db
			.select()
			.from(bankAccounts)
			.where(and(eq(bankAccounts.id, id), eq(bankAccounts.userId, userId)));
		if (!result) return null;
		return BankAccountMapper.toDomain(result);
	}

	async findAllByUserId(userId: string): Promise<BankAccount[]> {
		const results = await this.db
			.select()
			.from(bankAccounts)
			.where(eq(bankAccounts.userId, userId));
		return results.map(BankAccountMapper.toDomain);
	}

	async update(bankAccount: BankAccount): Promise<BankAccount> {
		const data = BankAccountMapper.toPersistence(bankAccount);
		const [updated] = await this.db
			.update(bankAccounts)
			.set(data)
			.where(eq(bankAccounts.id, bankAccount.id.toString()))
			.returning();
		if (!updated) throw new Error("Failed to update bank account");
		return BankAccountMapper.toDomain(updated);
	}

	async delete(id: string, userId: string): Promise<void> {
		await this.db
			.delete(bankAccounts)
			.where(and(eq(bankAccounts.id, id), eq(bankAccounts.userId, userId)));
	}
}