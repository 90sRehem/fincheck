import { Inject, Injectable } from "@nestjs/common";
import { and, eq } from "drizzle-orm";
import type { DrizzleDB } from "@/core/database";
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
		const [created] = await this.db
			.insert(bankAccounts)
			.values(data)
			.returning();
		if (!created) throw new Error("Failed to create bank account");

		// Busca com relations para retornar entidade completa (color, accountType, currency)
		const withRelations = await this.db.query.bankAccounts.findFirst({
			where: eq(bankAccounts.id, created.id),
			with: { color: true, accountType: true, currency: true },
		});
		if (!withRelations) throw new Error("Failed to fetch created bank account");
		return BankAccountMapper.toDomain(withRelations);
	}

	async findById(id: string, userId: string): Promise<BankAccount | null> {
		const result = await this.db.query.bankAccounts.findFirst({
			where: and(eq(bankAccounts.id, id), eq(bankAccounts.userId, userId)),
			with: {
				color: true,
				accountType: true,
				currency: true,
			},
		});
		if (!result) return null;
		return BankAccountMapper.toDomain(result);
	}

	async findAllByUserId(userId: string): Promise<BankAccount[]> {
		const results = await this.db.query.bankAccounts.findMany({
			where: eq(bankAccounts.userId, userId),
			with: { color: true, accountType: true, currency: true },
		});
		return results.map((result) => BankAccountMapper.toDomain(result));
	}

	async update(bankAccount: BankAccount): Promise<BankAccount> {
		const data = BankAccountMapper.toPersistence(bankAccount);
		const [updated] = await this.db
			.update(bankAccounts)
			.set(data)
			.where(eq(bankAccounts.id, bankAccount.id.toString()))
			.returning();
		if (!updated) throw new Error("Failed to update bank account");

		// Busca com relations para retornar entidade completa após update
		const withRelations = await this.db.query.bankAccounts.findFirst({
			where: eq(bankAccounts.id, updated.id),
			with: { color: true, accountType: true, currency: true },
		});
		if (!withRelations) throw new Error("Failed to fetch updated bank account");
		return BankAccountMapper.toDomain(withRelations);
	}

	async delete(id: string, userId: string): Promise<void> {
		await this.db
			.delete(bankAccounts)
			.where(and(eq(bankAccounts.id, id), eq(bankAccounts.userId, userId)));
	}
}
