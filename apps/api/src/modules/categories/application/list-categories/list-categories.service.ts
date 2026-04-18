import { Injectable } from "@nestjs/common";
import { CategoryRepository, ListCategoriesUseCase } from "../../domain";

@Injectable()
export class ListCategoriesService extends ListCategoriesUseCase {
	constructor(categoryRepository: CategoryRepository) {
		super(categoryRepository);
	}
}
