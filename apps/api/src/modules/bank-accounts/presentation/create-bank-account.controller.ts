import {
	BadRequestException,
	Body,
	Controller,
	HttpCode,
	HttpStatus,
	Post,
} from "@nestjs/common";
import {
	ApiBody,
	ApiCookieAuth,
	ApiOperation,
	ApiResponse,
	ApiTags,
} from "@nestjs/swagger";
import { Session } from "@thallesp/nestjs-better-auth";
import type { AuthSession } from "@/core/auth";
import { ValidationFieldsError } from "@/shared/domain/validators/validation-fields-error";
import {
	BankAccountResponseSchema,
	UnauthorizedErrorSchema,
	ValidationErrorSchema,
} from "@/shared/swagger/schemas";
import { createBankAccountSchema } from "../application/create-bank-account/create-bank-account.dto";
import { CreateBankAccountService } from "../application/create-bank-account/create-bank-account.service";
import { BankAccountMapper } from "../infra/mappers/bank-account.mapper";

@ApiTags("Bank Accounts")
@ApiCookieAuth("better-auth.session_token")
@Controller("bank-accounts")
export class CreateBankAccountController {
	constructor(
		private readonly createBankAccountService: CreateBankAccountService,
	) {}

	@Post()
	@HttpCode(HttpStatus.CREATED)
	@ApiOperation({
		summary: "Create Bank Account",
		description: "Cria uma nova conta bancária para o usuário autenticado.",
	})
	@ApiBody({
		description: "Dados da conta bancária",
		schema: {
			type: "object",
			required: ["name", "accountTypeId", "colorId"],
			properties: {
				name: {
					type: "string",
					minLength: 1,
					maxLength: 100,
					example: "Conta Corrente Nubank",
				},
				accountTypeId: {
					type: "string",
					example: "checking",
				},
				initialBalance: { type: "number", default: 0, example: 1500.0 },
				currencyId: { type: "string", default: "BRL", example: "BRL" },
				colorId: {
					type: "string",
					example: "indigo",
					description: "ID da cor",
				},
				icon: { type: "string", nullable: true, example: null },
			},
		},
	})
	@ApiResponse({
		status: 201,
		description: "Conta criada com sucesso",
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
	async create(@Session() session: AuthSession, @Body() body: unknown) {
		const parseResult = createBankAccountSchema.safeParse(body);

		if (!parseResult.success) {
			throw new BadRequestException(parseResult.error.flatten().fieldErrors);
		}

		const result = await this.createBankAccountService.create({
			userId: session.user.id,
			...parseResult.data,
		});

		if (result.isFailure) {
			const error = result.value;
			if (error instanceof ValidationFieldsError) {
				throw new BadRequestException(error.errors);
			}
			throw new BadRequestException("Failed to create bank account");
		}

		// biome-ignore lint/suspicious/noExplicitAny: Either type system requires this cast
		return BankAccountMapper.toResponse(result.value as any);
	}
}
