import { Inject, Injectable } from "@nestjs/common";
import type { DrizzleDB } from "@/core/database/connection";
import { DRIZZLE_DB } from "@/core/database/constants";
import { CategoryRepository } from "../../domain";
import { categories } from "../drizzle/schemas/category-schema";
import { CategoryMapper } from "../mappers/category.mapper";

@Injectable()
export class DrizzleCategoryRepository extends CategoryRepository {
	constructor(@Inject(DRIZZLE_DB) private readonly db: DrizzleDB) {
		super();
	}

	async findAll() {
		const rawCategories = await this.db.select().from(categories);
		return rawCategories.map((raw) => CategoryMapper.toDomain(raw));
	}
}
