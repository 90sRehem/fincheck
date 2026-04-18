import type { Either } from "@/shared/domain/types/either";
import { success } from "@/shared/domain/types/either";
import type { UseCase } from "@/shared/domain/types/use-case";
import { Color } from "../entities/color.entity";
import { ColorRepository } from "../repositories/color.repository";

export class ListColorsUseCase implements UseCase<void, Color[]> {
	constructor(private readonly colorRepository: ColorRepository) {}

	async execute(): Promise<Either<unknown, Color[]>> {
		const colors = await this.colorRepository.findAll();
		return success(colors);
	}
}
