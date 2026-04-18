import { Controller, Get } from "@nestjs/common";
import {
	ApiCookieAuth,
	ApiOperation,
	ApiResponse,
	ApiTags,
} from "@nestjs/swagger";
import { UnauthorizedErrorSchema } from "@/shared/swagger/schemas";
import { ListCategoriesService } from "../application/list-categories/list-categories.service";
import { CategoryMapper } from "../infra/mappers/category.mapper";

@ApiTags("Categories")
@ApiCookieAuth("better-auth.session_token")
@Controller("categories")
export class ListCategoriesController {
	constructor(private readonly listCategoriesService: ListCategoriesService) {}

	@Get()
	@ApiOperation({
		summary: "List Categories",
		description: "Retorna a lista de categorias disponíveis.",
	})
	@ApiResponse({
		status: 200,
		description: "Lista de categorias",
		schema: {
			type: "array",
			items: {
				type: "object",
				properties: {
					id: { type: "string", example: "food" },
					name: { type: "string", example: "Alimentação" },
				},
			},
		},
	})
	@ApiResponse({
		status: 401,
		description: "Não autenticado",
		schema: UnauthorizedErrorSchema,
	})
	async list() {
		const result = await this.listCategoriesService.execute();
		const categories = result.value as Array<{
			id: string;
			name: string;
		}>;
		return categories.map((category) => CategoryMapper.toResponse(category));
	}
}
