import { Module } from "@nestjs/common";
import { ListCategoriesService } from "./application/list-categories/list-categories.service";
import { CategoryRepository } from "./domain";
import { DrizzleCategoryRepository } from "./infra/persistence/drizzle-category.repository";
import { ListCategoriesController } from "./presentation/list-categories.controller";

@Module({
	controllers: [ListCategoriesController],
	providers: [
		{ provide: CategoryRepository, useClass: DrizzleCategoryRepository },
		ListCategoriesService,
	],
})
export class CategoriesModule {}
