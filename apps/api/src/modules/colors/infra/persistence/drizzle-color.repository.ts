import { Inject, Injectable } from "@nestjs/common";
import type { DrizzleDB } from "@/core/database/connection";
import { DRIZZLE_DB } from "@/core/database/constants";
import { ColorRepository } from "../../domain";
import { colors } from "../drizzle/schemas/color-schema";
import { ColorMapper } from "../mappers/color.mapper";

@Injectable()
export class DrizzleColorRepository extends ColorRepository {
	constructor(@Inject(DRIZZLE_DB) private readonly db: DrizzleDB) {
		super();
	}

	async findAll() {
		const rawColors = await this.db.select().from(colors);
		return rawColors.map((raw) => ColorMapper.toDomain(raw));
	}
}
