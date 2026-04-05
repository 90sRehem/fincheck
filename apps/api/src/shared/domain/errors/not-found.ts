import { UseCaseError } from "./use-case-error";

export class NotFoundError extends Error implements UseCaseError {
	constructor(message: string = "Resource not found") {
		super(message);
		this.name = "NotFoundError";
	}
}
