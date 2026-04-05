## ADDED Requirements

### Requirement: ValidationFieldsError
The system SHALL provide a `ValidationFieldsError` class that extends `Error` and carries an array of `{ field: string; message: string }` objects. This is the error type used in `Either<ValidationFieldsError, void>` throughout entity validation.

#### Scenario: Construct with field errors
- **WHEN** `new ValidationFieldsError([{ field: "amount", message: "must be positive" }])` is created
- **THEN** `error.errors` SHALL contain the array of field errors
- **THEN** `error.message` SHALL describe the validation failure

### Requirement: ValidationStrategy interface
The system SHALL provide a `ValidationStrategy<T>` interface with a single method: `validate(data: T): Either<ValidationFieldsError, void>`. This decouples entities from specific validation libraries.

#### Scenario: Entity delegates validation
- **WHEN** an Entity's `validate()` method calls `this.strategy.validate(this.props)`
- **THEN** the Entity is decoupled from the validation library (Zod, Joi, etc.)
- **THEN** the strategy returns `Either<ValidationFieldsError, void>`

### Requirement: ZodValidationStrategy implementation
The system SHALL provide a `ZodValidationStrategy<T>` class implementing `ValidationStrategy<T>` that:
- Accepts a Zod schema (`z.ZodSchema<T>`) in the constructor
- Calls `schema.safeParse(data)` in `validate()`
- On success: returns `success(undefined)`
- On failure: maps Zod errors to `ValidationFieldsError` field entries (joining Zod issue paths with `"."`) and returns `failure(new ValidationFieldsError(...))`

#### Scenario: Valid data passes
- **WHEN** `strategy.validate({ name: "Test", amount: 100 })` is called with data matching the schema
- **THEN** the result SHALL be a success (`result.isSuccess() === true`)

#### Scenario: Invalid data returns field errors
- **WHEN** `strategy.validate({ name: "", amount: -1 })` is called with data violating the schema
- **THEN** the result SHALL be a failure
- **THEN** `result.value` SHALL be a `ValidationFieldsError` with entries for each violated field

#### Scenario: Nested path joining
- **WHEN** a Zod error has path `["address", "zipCode"]`
- **THEN** the field name in ValidationFieldsError SHALL be `"address.zipCode"`
