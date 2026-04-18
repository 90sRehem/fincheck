import { Inject, Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import type { DrizzleDB } from "@/core/database/connection";
import { DRIZZLE_DB } from "@/core/database/constants";
import { AccountTypeRepository } from "../../domain";
import { accountTypes } from "../drizzle/schemas/account-type-schema";
import { AccountTypeMapper } from "../mappers/account-type.mapper";

@Injectable()
export class DrizzleAccountTypeRepository extends AccountTypeRepository {
	constructor(@Inject(DRIZZLE_DB) private readonly db: DrizzleDB) {
		super();
	}

	async findById(id: string) {
		const [raw] = await this.db
			.select()
			.from(accountTypes)
			.where(eq(accountTypes.id, id));
		return raw ? AccountTypeMapper.toDomain(raw) : null;
	}

	async findAll() {
		const rawAccountTypes = await this.db.select().from(accountTypes);
		return rawAccountTypes.map((raw) => AccountTypeMapper.toDomain(raw));
	}
}
