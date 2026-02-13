import { Controller, Get } from "@nestjs/common";
// biome-ignore lint/style/useImportType: <explanation nestjs project>
import { AppService } from "./app.service";

@Controller()
export class AppController {
	constructor(private readonly appService: AppService) {}

	@Get("health-check")
	healthCheck(): string {
		return this.appService.healthCheck();
	}
}
