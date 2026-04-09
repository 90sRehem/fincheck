import type { Either } from "./either";

export interface UseCase<Input, Output> {
	execute(input: Input): Promise<Either<unknown, Output>>;
}
