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
import { BANK_ACCOUNT_TYPE, type BankAccountType } from "../domain";

const ACCOUNT_TYPE_LABELS: Record<BankAccountType, string> = {
	checking: "Checking",
	savings: "Savings",
	credit_card: "Credit Card",
	cash: "Cash",
	investment: "Investment",
};

@ApiTags("Bank Accounts")
@ApiCookieAuth("better-auth.session_token")
@Controller("account_types")
export class ListAccountTypesController {
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
	list() {
		return Object.values(BANK_ACCOUNT_TYPE).map((type) => ({
			id: type,
			name: ACCOUNT_TYPE_LABELS[type],
		}));
	}
}
