export type UseCaseError = {
	message: string;
};

export interface IUseCase<Input, Output> {
	execute(input: Input): Promise<Output>;
}

export type Either<L, R> = IsFailure<L, R> | IsSuccess<L, R>;

export class IsFailure<L, R> {
	readonly isFailure = true;
	readonly isSuccess = false;

	constructor(public readonly value: L) {}

	isSuccessFn(fn: (value: L) => unknown): boolean {
		return false;
	}

	isFailureFn(fn: (value: L) => unknown): boolean {
		fn(this.value);
		return true;
	}
}

export class IsSuccess<L, R> {
	readonly isFailure = false;
	readonly isSuccess = true;

	constructor(public readonly value: R) {}

	isSuccessFn(fn: (value: R) => unknown): boolean {
		fn(this.value);
		return true;
	}

	isFailureFn(fn: (value: L) => unknown): boolean {
		return false;
	}
}

export function failure<L, R>(value: L): Either<L, R> {
	return new IsFailure(value);
}

export function success<L, R>(value: R): Either<L, R> {
	return new IsSuccess(value);
}
