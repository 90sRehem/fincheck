import { Module } from "@nestjs/common";
import { ListColorsService } from "./application/list-colors/list-colors.service";
import { ColorRepository } from "./domain";
import { DrizzleColorRepository } from "./infra/persistence/drizzle-color.repository";
import { ListColorsController } from "./presentation/list-colors.controller";

@Module({
	controllers: [ListColorsController],
	providers: [
		{ provide: ColorRepository, useClass: DrizzleColorRepository },
		ListColorsService,
	],
})
export class ColorsModule {}
