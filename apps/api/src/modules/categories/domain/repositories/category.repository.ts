import { Category } from "../entities/category.entity";

export abstract class CategoryRepository {
	abstract findAll(): Promise<Category[]>;
}
