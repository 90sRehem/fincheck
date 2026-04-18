import { Category } from "../../domain";

// biome-ignore lint/complexity/noStaticOnlyClass: mapper pattern
export class CategoryMapper {
	static toDomain(raw: { id: string; name: string }) {
		return new Category(raw.id, raw.name);
	}

	static toResponse(entity: Category) {
		return {
			id: entity.id,
			name: entity.name,
		};
	}
}
