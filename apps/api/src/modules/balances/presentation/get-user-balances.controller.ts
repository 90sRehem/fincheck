import { Controller, Get } from "@nestjs/common";
import {
	ApiCookieAuth,
	ApiOperation,
	ApiResponse,
	ApiTags,
} from "@nestjs/swagger";
import { Session } from "@thallesp/nestjs-better-auth";
import type { AuthSession } from "@/core/auth";
import { UnauthorizedErrorSchema } from "@/shared/swagger/schemas";
import { GetUserBalancesService } from "../application/get-user-balances/get-user-balances.service";

@ApiTags("Balances")
@ApiCookieAuth("better-auth.session_token")
@Controller("balances")
export class GetUserBalancesController {
	constructor(
		private readonly getUserBalancesService: GetUserBalancesService,
	) {}

	@Get()
	@ApiOperation({
		summary: "Get User Balances",
		description:
			"Retorna os saldos agregados por moeda do usuário autenticado.",
	})
	@ApiResponse({
		status: 200,
		description: "Saldos agregados por moeda",
		schema: {
			type: "array",
			items: {
				type: "object",
				properties: {
					amountCents: { type: "number", example: 150000 },
					currency: { type: "string", example: "BRL" },
				},
			},
		},
	})
	@ApiResponse({
		status: 401,
		description: "Não autenticado",
		schema: UnauthorizedErrorSchema,
	})
	async getBalances(@Session() session: AuthSession) {
		const result = await this.getUserBalancesService.execute({
			userId: session.user.id,
		});

		return result.value;
	}
}
