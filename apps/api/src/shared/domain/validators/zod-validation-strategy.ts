import { z } from "zod";
import { Either, failure, success } from "../types/either";
import { ValidationFieldsError } from "./validation-fields-error";

export interface ValidationStrategy<T> {
	validate(data: T): Either<ValidationFieldsError, void>;
}

export class ZodValidationStrategy<T> implements ValidationStrategy<T> {
	constructor(private readonly schema: z.ZodSchema<T>) {}

	validate(data: T): Either<ValidationFieldsError, void> {
		const result = this.schema.safeParse(data);

		if (result.success) {
			return success(undefined);
		}

		const errors = result.error.issues.map((issue) => ({
			field: issue.path.join("."),
			message: issue.message,
		}));

		return failure(new ValidationFieldsError(errors));
	}
}
