import type { Either } from "../types/either";
import type { ValidationFieldsError } from "./validation-fields-error";

export interface ValidationStrategy<T> {
	validate(data: T): Either<ValidationFieldsError, void>;
}
