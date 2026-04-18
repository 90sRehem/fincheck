import type { Either } from "@/shared/domain/types/either";
import { success } from "@/shared/domain/types/either";
import type { UseCase } from "@/shared/domain/types/use-case";
import { Category } from "../entities/category.entity";
import { CategoryRepository } from "../repositories/category.repository";

export class ListCategoriesUseCase implements UseCase<void, Category[]> {
	constructor(private readonly categoryRepository: CategoryRepository) {}

	async execute(): Promise<Either<unknown, Category[]>> {
		const categories = await this.categoryRepository.findAll();
		return success(categories);
	}
}
