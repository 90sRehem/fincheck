import {
	BadRequestException,
	Body,
	Controller,
	HttpCode,
	HttpStatus,
	NotFoundException,
	Param,
	ParseUUIDPipe,
	Put,
} from "@nestjs/common";
import {
	ApiBody,
	ApiCookieAuth,
	ApiOperation,
	ApiParam,
	ApiResponse,
	ApiTags,
} from "@nestjs/swagger";
import { Session } from "@thallesp/nestjs-better-auth";
import { NotFoundError } from "@/shared/domain/errors/not-found";
import { ValidationFieldsError } from "@/shared/domain/validators/validation-fields-error";
import {
	BankAccountResponseSchema,
	NotFoundErrorSchema,
	UnauthorizedErrorSchema,
	ValidationErrorSchema,
} from "@/shared/swagger/schemas";
import { updateBankAccountSchema } from "../application/update-bank-account/update-bank-account.dto";
import { UpdateBankAccountService } from "../application/update-bank-account/update-bank-account.service";
import { BankAccountMapper } from "../infra/mappers/bank-account.mapper";

@ApiTags("Bank Accounts")
@ApiCookieAuth("better-auth.session_token")
@Controller("bank-accounts")
export class UpdateBankAccountController {
	constructor(
		private readonly updateBankAccountService: UpdateBankAccountService,
	) {}

	@Put(":id")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({
		summary: "Update Bank Account",
		description:
			"Atualiza os dados de uma conta bancária existente. Todos os campos são opcionais.",
	})
	@ApiParam({
		name: "id",
		description: "ID da conta bancária (UUID)",
		example: "550e8400-e29b-41d4-a716-446655440000",
	})
	@ApiBody({
		description: "Campos a atualizar (todos opcionais)",
		schema: {
			type: "object",
			properties: {
				name: {
					type: "string",
					minLength: 1,
					maxLength: 100,
					example: "Conta Poupança",
				},
				type: {
					type: "string",
					enum: ["checking", "savings", "credit_card", "cash", "investment"],
					example: "savings",
				},
				initialBalance: { type: "number", example: 2000.0 },
				currency: { type: "string", example: "BRL" },
				color: {
					type: "string",
					pattern: "^#[0-9A-Fa-f]{6}$",
					example: "#10B981",
				},
				icon: { type: "string", nullable: true, example: null },
			},
		},
	})
	@ApiResponse({
		status: 200,
		description: "Conta bancária atualizada com sucesso",
		schema: BankAccountResponseSchema,
	})
	@ApiResponse({
		status: 400,
		description: "Dados inválidos",
		schema: ValidationErrorSchema,
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
	async update(
		@Session() session: { userId: string },
		@Param("id", ParseUUIDPipe) id: string,
		@Body() body: unknown,
	) {
		const parseResult = updateBankAccountSchema.safeParse(body);

		if (!parseResult.success) {
			throw new BadRequestException(parseResult.error.flatten().fieldErrors);
		}

		const result = await this.updateBankAccountService.execute({
			id,
			userId: session.userId,
			data: parseResult.data,
		});

		if (result.isFailure) {
			const error = result.value;
			if (error instanceof NotFoundError) {
				throw new NotFoundException(error.message);
			}
			if (error instanceof ValidationFieldsError) {
				throw new BadRequestException(error.errors);
			}
			throw new BadRequestException("Failed to update bank account");
		}

		return BankAccountMapper.toResponse(result.value as any);
	}
}
