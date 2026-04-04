import { Controller, Get } from "@nestjs/common";
// biome-ignore lint/style/useImportType: <explanation nestjs project>
import { AppService } from "./app.service";
import { AllowAnonymous } from "@thallesp/nestjs-better-auth";

@Controller()
export class AppController {
	constructor(private readonly appService: AppService) {}

	@AllowAnonymous()
	@Get("health-check")
	healthCheck(): string {
		return this.appService.healthCheck();
	}
}
