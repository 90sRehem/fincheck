import { Color } from "../entities/color.entity";

export abstract class ColorRepository {
	abstract findById(id: string): Promise<Color | null>;
	abstract findAll(): Promise<Color[]>;
}
