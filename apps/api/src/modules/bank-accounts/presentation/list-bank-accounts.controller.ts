import { Controller, Get } from "@nestjs/common";
import {
	ApiCookieAuth,
	ApiOperation,
	ApiResponse,
	ApiTags,
} from "@nestjs/swagger";
import { Session } from "@thallesp/nestjs-better-auth";
import type { AuthSession } from "@/core/auth";
import {
	BankAccountResponseSchema,
	UnauthorizedErrorSchema,
} from "@/shared/swagger/schemas";
import { ListBankAccountsService } from "../application/list-bank-accounts/list-bank-accounts.service";
import { BankAccount } from "../domain";
import { BankAccountMapper } from "../infra/mappers/bank-account.mapper";

@ApiTags("Bank Accounts")
@ApiCookieAuth("better-auth.session_token")
@Controller("bank-accounts")
export class ListBankAccountsController {
	constructor(
		private readonly listBankAccountsService: ListBankAccountsService,
	) {}

	@Get()
	@ApiOperation({
		summary: "List Bank Accounts",
		description: "Retorna todas as contas bancárias do usuário autenticado.",
	})
	@ApiResponse({
		status: 200,
		description: "Lista de contas bancárias",
		schema: { type: "array", items: BankAccountResponseSchema },
	})
	@ApiResponse({
		status: 401,
		description: "Não autenticado",
		schema: UnauthorizedErrorSchema,
	})
	async list(@Session() session: AuthSession) {
		const result = await this.listBankAccountsService.execute({
			userId: session.user.id,
		});

		const accounts = result.value as BankAccount[];
		return accounts.map(BankAccountMapper.toResponse);
	}
}
