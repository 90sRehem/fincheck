export type ValidationErrorField = {
	field: string;
	message: string;
};

export class ValidationError extends Error {
	constructor(public readonly errors: ValidationErrorField[]) {
		const message = errors.map((e) => `${e.field}: ${e.message}`).join(", ");
		super(`Validation failed: ${message}`);
		this.name = "ValidationError";
	}

	hasErrorForField(field: string): boolean {
		return this.errors.some((e) => e.field === field);
	}

	getErrorForField(field: string): string | undefined {
		return this.errors.find((e) => e.field === field)?.message;
	}
}
