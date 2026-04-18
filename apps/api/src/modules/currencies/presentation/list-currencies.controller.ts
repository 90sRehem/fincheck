import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AllowAnonymous } from "@thallesp/nestjs-better-auth";
import { ListCurrenciesService } from "../application/list-currencies/list-currencies.service";
import { CurrencyMapper } from "../infra/mappers/currency.mapper";

@Controller("currencies")
@ApiTags("Currencies")
export class ListCurrenciesController {
	constructor(private readonly listCurrenciesService: ListCurrenciesService) {}

	@Get()
	@AllowAnonymous()
	@ApiOperation({ summary: "List all currencies" })
	@ApiResponse({
		status: 200,
		description: "Currencies retrieved successfully",
	})
	async handle() {
		const result = await this.listCurrenciesService.execute();

		if (result.isSuccess) {
			return result.value.map((currency) =>
				CurrencyMapper.toResponse(currency),
			);
		}

		return [];
	}
}
