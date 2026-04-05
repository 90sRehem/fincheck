## ADDED Requirements

### Requirement: UseCaseError type
The system SHALL provide a `UseCaseError` type defined as `{ message: string }`. This MUST be a type alias (not a class), serving as the contract for all domain use-case errors.

#### Scenario: Error class implements UseCaseError
- **WHEN** a class `extends Error implements UseCaseError`
- **THEN** TypeScript SHALL enforce that the class has a `message: string` property

### Requirement: NotFoundError
The system SHALL provide a `NotFoundError` class that extends `Error` and implements `UseCaseError`. It MUST accept an optional custom message in the constructor, defaulting to `"Resource not found"`.

#### Scenario: Default message
- **WHEN** `new NotFoundError()` is created
- **THEN** `error.message` SHALL be `"Resource not found"`

#### Scenario: Custom message
- **WHEN** `new NotFoundError("Transaction not found")` is created
- **THEN** `error.message` SHALL be `"Transaction not found"`

#### Scenario: Is instanceof Error
- **WHEN** a NotFoundError is created
- **THEN** `error instanceof Error` SHALL be `true`

### Requirement: NotAllowedError
The system SHALL provide a `NotAllowedError` class that extends `Error` and implements `UseCaseError`. It MUST have a fixed message `"Not allowed"`.

#### Scenario: Fixed message
- **WHEN** `new NotAllowedError()` is created
- **THEN** `error.message` SHALL be `"Not allowed"`

### Requirement: ValidationError with field details
The system SHALL provide a `ValidationError` class that extends `Error` and carries an array of `{ field: string; message: string }` error details. It MUST:
- Construct a readable message like `"Validation failed: field1: msg1, field2: msg2"`
- Provide `hasErrorForField(field: string): boolean`
- Provide `getErrorForField(field: string): string | undefined` returning the message for a specific field

#### Scenario: Multiple field errors
- **WHEN** `new ValidationError([{ field: "email", message: "required" }, { field: "name", message: "too short" }])` is created
- **THEN** `error.message` SHALL contain `"email: required"` and `"name: too short"`
- **THEN** `error.hasErrorForField("email")` SHALL return `true`
- **THEN** `error.getErrorForField("email")` SHALL return `"required"`
- **THEN** `error.hasErrorForField("age")` SHALL return `false`
