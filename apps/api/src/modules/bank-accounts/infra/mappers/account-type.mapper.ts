import { AccountType } from "../../domain";

// biome-ignore lint/complexity/noStaticOnlyClass: mapper pattern
export class AccountTypeMapper {
	static toDomain(raw: { id: string; name: string }) {
		return new AccountType(raw.id, raw.name);
	}

	static toResponse(entity: AccountType) {
		return {
			id: entity.id,
			name: entity.name,
		};
	}
}
