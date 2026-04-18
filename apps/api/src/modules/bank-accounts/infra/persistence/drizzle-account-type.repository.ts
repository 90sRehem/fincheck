import { Inject, Injectable } from "@nestjs/common";
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

	async findAll() {
		const rawAccountTypes = await this.db.select().from(accountTypes);
		return rawAccountTypes.map((raw) => AccountTypeMapper.toDomain(raw));
	}
}
