import { Color } from "../entities/color.entity";

export abstract class ColorRepository {
	abstract findAll(): Promise<Color[]>;
}
