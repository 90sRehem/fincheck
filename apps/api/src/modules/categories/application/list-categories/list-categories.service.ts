import { Injectable } from "@nestjs/common";
import { CategoryRepository, ListCategoriesUseCase } from "../../domain";

@Injectable()
export class ListCategoriesService extends ListCategoriesUseCase {
	// biome-ignore lint/complexity/noUselessConstructor: NestJS DI requires explicit constructor for dependency injection
	constructor(categoryRepository: CategoryRepository) {
		super(categoryRepository);
	}
}
