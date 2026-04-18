import { Controller, Get, VERSION_NEUTRAL } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AllowAnonymous } from "@thallesp/nestjs-better-auth";
// biome-ignore lint/style/useImportType: <explanation nestjs project>
import { AppService } from "./app.service";

@ApiTags("Health")
@Controller({ version: VERSION_NEUTRAL })
export class AppController {
	constructor(private readonly appService: AppService) {}

	@AllowAnonymous()
	@Get("health-check")
	@ApiOperation({
		summary: "Health Check",
		description: "Verifica se a API está online e respondendo.",
	})
	@ApiResponse({
		status: 200,
		description: "API online",
		schema: {
			type: "object",
			properties: { status: { type: "string", example: "healthy" } },
		},
	})
	healthCheck(): string {
		return this.appService.healthCheck();
	}
}
