import { Controller, Get } from "@nestjs/common";
import {
	ApiCookieAuth,
	ApiOperation,
	ApiResponse,
	ApiTags,
} from "@nestjs/swagger";
import {
	AccountTypeResponseSchema,
	UnauthorizedErrorSchema,
} from "@/shared/swagger/schemas";
import { ListAccountTypesService } from "../application/list-account-types/list-account-types.service";
import { AccountTypeMapper } from "../infra/mappers/account-type.mapper";

@ApiTags("Bank Accounts")
@ApiCookieAuth("better-auth.session_token")
@Controller("account_types")
export class ListAccountTypesController {
	constructor(
		private readonly listAccountTypesService: ListAccountTypesService,
	) {}

	@Get()
	@ApiOperation({
		summary: "List Account Types",
		description: "Retorna os tipos de conta bancária disponíveis.",
	})
	@ApiResponse({
		status: 200,
		description: "Lista de tipos de conta",
		schema: { type: "array", items: AccountTypeResponseSchema },
	})
	@ApiResponse({
		status: 401,
		description: "Não autenticado",
		schema: UnauthorizedErrorSchema,
	})
	async list() {
		const result = await this.listAccountTypesService.execute();
		const accountTypes = result.value as Array<{ id: string; name: string }>;
		return accountTypes.map((accountType) =>
			AccountTypeMapper.toResponse(accountType),
		);
	}
}
