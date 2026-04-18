import { Injectable } from "@nestjs/common";
import { ColorRepository, ListColorsUseCase } from "../../domain";

@Injectable()
export class ListColorsService extends ListColorsUseCase {
	// biome-ignore lint/complexity/noUselessConstructor: NestJS DI requires explicit constructor for dependency injection
	constructor(colorRepository: ColorRepository) {
		super(colorRepository);
	}
}
