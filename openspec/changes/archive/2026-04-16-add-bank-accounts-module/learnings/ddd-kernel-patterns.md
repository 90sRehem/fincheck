# DDD Kernel Patterns

## Context

Mapped the complete DDD domain kernel in `apps/api/src/shared/domain/` to understand base classes, conventions, and how to wire the first real domain module. This kernel is fully implemented but has zero consumers — understanding it is essential before writing any domain entity.

## Findings

### Entity Base Class

Located at `apps/api/src/shared/domain/entities/entity.ts`.

- Generic `Entity<T>` where `T` is the props interface for the specific entity
- Props always include `EntityProps` (`createdAt`, `updatedAt`) merged via intersection
- Constructor receives `props: T & EntityProps` and optional `id?: string`
- ID is a `Id` value object (UUIDv4), auto-generated if not provided
- `update(props: Partial<T>)` — merges partial props and bumps `updatedAt`
- `validate()` — abstract, must return `Either<ValidationFieldsError, void>`
- `equals()` — identity comparison by ID
- `toJSON()` — serializes `{ id, ...props }`

Usage pattern for subclasses:
```ts
class MyEntity extends Entity<MyProps> {
  private constructor(props: MyProps & EntityProps, id?: string) {
    super(props, id);
  }
  static create(props: MyProps, id?: string): MyEntity {
    return new MyEntity({ ...props, createdAt: new Date(), updatedAt: new Date() }, id);
  }
  validate(): Either<ValidationFieldsError, void> { /* Zod validation */ }
}
```

### AggregateRoot

Located at `apps/api/src/shared/domain/entities/aggregate-root.ts`.

- Extends `Entity<T>`, adds `_domainEvents: DomainEvent[]`
- `addDomainEvent(event)` — pushes to internal array
- `clearEvents()` — resets array (called by dispatcher after publishing)
- Use for entities that are the root of a consistency boundary (e.g., `BankAccount` is an aggregate root, but a `Transaction` line item would be a child entity)

### Value Objects

Located at `apps/api/src/shared/domain/value-objects/`.

- `ValueObject<T>` — immutable (props frozen via `Object.freeze`), equality by value (JSON comparison)
- `Id` — extends `ValueObject<string>`, factory `Id.create(id?)` generates UUIDv4 if no id given, `Id.fromString(value)` for parsing with empty check

### Either Monad (Error Handling)

Located at `apps/api/src/shared/domain/types/either.ts`.

- `Either<L, R>` = `IsFailure<L, R> | IsSuccess<L, R>`
- `failure(value)` — creates `IsFailure` with `.isFailure = true`
- `success(value)` — creates `IsSuccess` with `.isSuccess = true`
- Access value via `.value` after checking `.isFailure` / `.isSuccess`
- Used as return type for use cases: `Either<SomeError, ResultType>`

Pattern in use cases:
```ts
const result = await useCase.execute(input);
if (result.isFailure) {
  // result.value is the error (left side)
  throw new NotFoundException(result.value.message);
}
// result.value is the success payload (right side)
return result.value;
```

### UseCase Interface

Located at `apps/api/src/shared/domain/types/use-case.ts`.

- `UseCase<Input, Output>` with single method `execute(input: Input): Promise<Output>`
- Each use case is an `@Injectable()` class implementing this interface
- One use case per folder, one concern per class

### Validation Strategy (Zod)

Located at `apps/api/src/shared/domain/validators/zod-validation-strategy.ts`.

- `ZodValidationStrategy<T>` implements `ValidationStrategy<T>`
- Constructor receives `z.ZodSchema<T>`
- `validate(data)` returns `Either<ValidationFieldsError, void>`
- On failure, maps Zod issues to `{ field, message }` array wrapped in `ValidationFieldsError`

Usage pattern for entity validators:
```ts
class MyEntityValidator extends ZodValidationStrategy<MyProps> {
  constructor() {
    super(z.object({
      name: z.string().min(1),
      // ...
    }));
  }
}
// In entity.validate():
return new MyEntityValidator().validate(this.props);
```

### Error Hierarchy

Located at `apps/api/src/shared/domain/errors/`.

| Class | File | Purpose |
|---|---|---|
| `UseCaseError` | `use-case-error.ts` | Type `{ message: string }` — interface for error typing |
| `NotFoundError` | `not-found.ts` | `extends Error implements UseCaseError`, default msg "Resource not found" |
| `NotAllowedError` | `not-allowed.ts` | `extends Error implements UseCaseError`, msg "Not allowed" |
| `ValidationError` | `validation-error.ts` | `extends Error`, holds `errors: ValidationErrorField[]`, with `hasErrorForField()` and `getErrorForField()` helpers |
| `ValidationFieldsError` | `validation-fields-error.ts` | `extends Error`, holds `errors: ErrorField[]` — used by `ZodValidationStrategy` |

Note: `ValidationError` and `ValidationFieldsError` are similar but separate classes. `ValidationFieldsError` is used by the Zod strategy, `ValidationError` is a standalone validation error.

### Domain Events

Located at `apps/api/src/shared/domain/events/`.

- `DomainEvent` interface — `occurredAt: Date`, `getAggregateId(): Id`
- `DomainEventDispatcher` abstract class (`@Injectable()`) — `dispatch(event)`, `dispatchAll(aggregate)`
- Implemented by `NestJsEventDispatcher` in `core/events/nestjs-event-dispatcher.ts:6` using `EventEmitter2`
- `dispatchAll()` iterates aggregate's events, dispatches each, then calls `clearEvents()`
- Wired globally via `EventsModule` — inject `DomainEventDispatcher` in any module

### Barrel Exports

Main barrel at `apps/api/src/shared/domain/index.ts` exports everything. Import from `@/shared/domain` (path alias in backend).

Key exports: `Entity`, `EntityProps`, `AggregateRoot`, `ValueObject`, `Id`, `Either`, `failure`, `success`, `UseCase`, `Pagination`, `NotFoundError`, `NotAllowedError`, `ValidationFieldsError`, `ZodValidationStrategy`, `DomainEvent`, `DomainEventDispatcher`, `WatchedList`.

## Decisions / Open Questions

- Decision: Entities use private constructors + static `create()` factory — enforces invariants at creation time
- Decision: Validation is a separate class (strategy pattern), not inline in entity — allows reuse and testing
- Decision: Use cases return `Either` — controllers map left side to HTTP exceptions
- Open: `ValidationError` vs `ValidationFieldsError` are redundant — may consolidate in the future
- Open: `Either` file (`either.ts`) re-declares `UseCaseError` type and `IUseCase` interface that also exist in separate files — minor duplication

## References

- `apps/api/src/shared/domain/entities/entity.ts` — Entity base class
- `apps/api/src/shared/domain/entities/aggregate-root.ts` — AggregateRoot
- `apps/api/src/shared/domain/value-objects/value-object.ts` — ValueObject base
- `apps/api/src/shared/domain/value-objects/id.ts` — Id value object
- `apps/api/src/shared/domain/types/either.ts` — Either monad
- `apps/api/src/shared/domain/types/use-case.ts` — UseCase interface
- `apps/api/src/shared/domain/types/pagination.ts` — Pagination type
- `apps/api/src/shared/domain/validators/zod-validation-strategy.ts` — Zod validation
- `apps/api/src/shared/domain/validators/validation-fields-error.ts` — Validation error type
- `apps/api/src/shared/domain/errors/not-found.ts` — NotFoundError
- `apps/api/src/shared/domain/errors/not-allowed.ts` — NotAllowedError
- `apps/api/src/shared/domain/events/domain-event.ts` — DomainEvent interface
- `apps/api/src/shared/domain/events/domain-event-dispatcher.ts` — Dispatcher abstract class
- `apps/api/src/shared/domain/index.ts` — Main barrel export
