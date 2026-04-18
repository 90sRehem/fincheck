import { Controller, Get } from "@nestjs/common";
import {
	ApiCookieAuth,
	ApiOperation,
	ApiResponse,
	ApiTags,
} from "@nestjs/swagger";
import { UnauthorizedErrorSchema } from "@/shared/swagger/schemas";
import { ListColorsService } from "../application/list-colors/list-colors.service";
import { ColorMapper } from "../infra/mappers/color.mapper";

@ApiTags("Colors")
@ApiCookieAuth("better-auth.session_token")
@Controller("colors")
export class ListColorsController {
	constructor(private readonly listColorsService: ListColorsService) {}

	@Get()
	@ApiOperation({
		summary: "List Colors",
		description: "Retorna a lista de cores disponíveis.",
	})
	@ApiResponse({
		status: 200,
		description: "Lista de cores",
		schema: {
			type: "array",
			items: {
				type: "object",
				properties: {
					id: { type: "string", example: "indigo" },
					name: { type: "string", example: "Indigo" },
					hex: { type: "string", example: "#4C6EF5" },
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
		const result = await this.listColorsService.execute();
		const colors = result.value as Array<{
			id: string;
			name: string;
			hex: string;
		}>;
		return colors.map((color) => ColorMapper.toResponse(color));
	}
}
