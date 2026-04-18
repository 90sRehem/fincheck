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
			required: ["name", "type", "color"],
			properties: {
				name: {
					type: "string",
					minLength: 1,
					maxLength: 100,
					example: "Conta Corrente Nubank",
				},
				type: {
					type: "string",
					enum: ["checking", "savings", "credit_card", "cash", "investment"],
					example: "checking",
				},
				initialBalance: { type: "number", default: 0, example: 1500.0 },
				currency: { type: "string", default: "BRL", example: "BRL" },
				color: {
					type: "string",
					pattern: "^#[0-9A-Fa-f]{6}$",
					example: "#8B5CF6",
					description: "Cor em formato hexadecimal (#RRGGBB)",
				},
				icon: { type: "string", nullable: true, example: null },
			},
		},
	})
	@ApiResponse({
		status: 201,
		description: "Conta bancária criada com sucesso",
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

		const result = await this.createBankAccountService.execute({
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

		return BankAccountMapper.toResponse(result.value);
	}
}
