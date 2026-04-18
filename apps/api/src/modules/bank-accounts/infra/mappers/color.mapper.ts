import { Color } from "../../domain/entities/color.entity";

// biome-ignore lint/complexity/noStaticOnlyClass: mapper pattern
export class ColorMapper {
	static toDomain(raw: { id: string; name: string; hex: string }) {
		return new Color(raw.id, raw.name, raw.hex);
	}

	static toResponse(entity: Color) {
		return {
			id: entity.id,
			name: entity.name,
			hex: entity.hex,
		};
	}
}
