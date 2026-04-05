## ADDED Requirements

### Requirement: Either monad
The system SHALL provide an `Either<L, R>` type alias that is a union of `IsFailure<L, R>` and `IsSuccess<L, R>`. Each variant MUST:
- Store a `value` property (typed as `L` for failure, `R` for success)
- Provide `isFailure()` and `isSuccess()` methods with TypeScript type narrowing via `this is` predicates
- The module MUST export `failure(value: L)` and `success(value: R)` factory functions

#### Scenario: Success path with type narrowing
- **WHEN** `const result: Either<Error, string> = success("ok")` is created
- **THEN** `result.isSuccess()` SHALL return `true`
- **THEN** after checking `result.isSuccess()`, TypeScript SHALL narrow `result.value` to `string`

#### Scenario: Failure path with type narrowing
- **WHEN** `const result: Either<Error, string> = failure(new Error("fail"))` is created
- **THEN** `result.isFailure()` SHALL return `true`
- **THEN** after checking `result.isFailure()`, TypeScript SHALL narrow `result.value` to `Error`

#### Scenario: Mutually exclusive checks
- **WHEN** a result is a success
- **THEN** `result.isFailure()` SHALL return `false`

### Requirement: UseCase interface
The system SHALL provide a `UseCase<Input, Output>` interface with a single method: `execute(input: Input): Promise<Output>`. This MUST be a TypeScript interface (not abstract class).

#### Scenario: Service implements UseCase
- **WHEN** a NestJS service class declares `implements UseCase<MyInput, Either<MyError, MyOutput>>`
- **THEN** TypeScript SHALL enforce the `execute(input: MyInput): Promise<Either<MyError, MyOutput>>` signature

### Requirement: Optional utility type
The system SHALL provide an `Optional<T, K extends keyof T>` type that makes keys `K` optional while keeping all other keys required. Equivalent to `Pick<Partial<T>, K> & Omit<T, K>`.

#### Scenario: Optional makes selected keys optional
- **WHEN** `Optional<{ name: string; age: number; email: string }, 'age' | 'email'>` is used
- **THEN** the resulting type SHALL require `name` and make `age` and `email` optional

### Requirement: Pagination type
The system SHALL provide a `Pagination` type with `page: number` and `limit: number` properties.

#### Scenario: Pagination type usage
- **WHEN** a function accepts `pagination: Pagination`
- **THEN** the caller MUST provide both `page` and `limit` as numbers
