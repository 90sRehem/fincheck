import {
	BadRequestException,
	Controller,
	Delete,
	HttpCode,
	HttpStatus,
	NotFoundException,
	Param,
	ParseUUIDPipe,
} from "@nestjs/common";
import {
	ApiCookieAuth,
	ApiOperation,
	ApiParam,
	ApiResponse,
	ApiTags,
} from "@nestjs/swagger";
import { Session } from "@thallesp/nestjs-better-auth";
import type { AuthSession } from "@/core/auth";
import { NotFoundError } from "@/shared/domain/errors/not-found";
import {
	NotFoundErrorSchema,
	UnauthorizedErrorSchema,
} from "@/shared/swagger/schemas";
import { DeleteBankAccountService } from "../application/delete-bank-account/delete-bank-account.service";

@ApiTags("Bank Accounts")
@ApiCookieAuth("better-auth.session_token")
@Controller("bank-accounts")
export class DeleteBankAccountController {
	constructor(
		private readonly deleteBankAccountService: DeleteBankAccountService,
	) {}

	@Delete(":id")
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({
		summary: "Delete Bank Account",
		description:
			"Remove permanentemente uma conta bancária. Esta ação não pode ser desfeita.",
	})
	@ApiParam({
		name: "id",
		description: "ID da conta bancária (UUID)",
		example: "550e8400-e29b-41d4-a716-446655440000",
	})
	@ApiResponse({
		status: 204,
		description: "Conta bancária removida com sucesso",
	})
	@ApiResponse({
		status: 401,
		description: "Não autenticado",
		schema: UnauthorizedErrorSchema,
	})
	@ApiResponse({
		status: 404,
		description: "Conta bancária não encontrada",
		schema: NotFoundErrorSchema,
	})
	async delete(
		@Session() session: AuthSession,
		@Param("id", ParseUUIDPipe) id: string,
	) {
		const result = await this.deleteBankAccountService.execute({
			id,
			userId: session.user.id,
		});

		if (result.isFailure) {
			const error = result.value;
			if (error instanceof NotFoundError) {
				throw new NotFoundException(error.message);
			}
			throw new BadRequestException("Failed to delete bank account");
		}

		return undefined;
	}
}
