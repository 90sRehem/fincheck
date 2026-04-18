import { Inject, Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import type { DrizzleDB } from "@/core/database";
import { DRIZZLE_DB } from "@/core/database/constants";
import { colors } from "../../../colors/infra/drizzle/schemas/color-schema";
import { Color } from "../../domain/entities/color.entity";
import { ColorRepository } from "../../domain/repositories/color.repository";
import { ColorMapper } from "../mappers/color.mapper";

@Injectable()
export class DrizzleColorRepository extends ColorRepository {
	constructor(@Inject(DRIZZLE_DB) private readonly db: DrizzleDB) {
		super();
	}

	async findById(id: string): Promise<Color | null> {
		const result = await this.db.select().from(colors).where(eq(colors.id, id));
		if (result.length === 0) return null;
		const color = result[0];
		if (!color) return null;
		return ColorMapper.toDomain(color);
	}

	async findAll(): Promise<Color[]> {
		const results = await this.db.select().from(colors);
		return results.map((raw) => ColorMapper.toDomain(raw));
	}
}
