export type ErrorField = {
	field: string;
	message: string;
};

export class ValidationFieldsError extends Error {
	constructor(public readonly errors: ErrorField[]) {
		const message = errors.map((e) => `${e.field}: ${e.message}`).join(", ");
		super(message);
		this.name = "ValidationFieldsError";
	}
}
