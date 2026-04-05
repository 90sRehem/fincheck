## 1. Setup and Dependencies

- [x] 1.1 [api] Install `@nestjs/event-emitter` — run `bun add --filter @fincheck/api @nestjs/event-emitter`. Verify it appears in `apps/api/package.json` dependencies.
- [x] 1.2 [api] Rename `src/shared/domain/validation/` to `src/shared/domain/validators/` and create `src/shared/domain/errors/` directory. Remove empty scaffolded directories that will be recreated with files.

## 2. Value Objects (zero dependencies)

- [x] 2.1 [api/shared/domain] Implement `value-objects/value-object.ts` — abstract `ValueObject<T>` with immutable value, structural `equals()`, `toString()`. Unit test: equality, inequality, immutability.
- [x] 2.2 [api/shared/domain] Implement `value-objects/id.ts` — `Id extends ValueObject<string>`, `crypto.randomUUID()`, `Id.fromString()` with empty-string validation, `toString()` override. Unit test: auto-generate UUID, from string, empty throws, equality.
- [x] 2.3 [api/shared/domain] Create `value-objects/index.ts` barrel export.

## 3. Types (zero dependencies)

- [x] 3.1 [api/shared/domain] Implement `types/either.ts` — `IsFailure<L,R>`, `IsSuccess<L,R>`, `Either<L,R>` union, `failure()` and `success()` factories with `this is` type narrowing. Unit test: success path, failure path, type narrowing, mutual exclusion.
- [x] 3.2 [api/shared/domain] Implement `types/use-case.ts` — `UseCase<Input, Output>` interface with `execute(input: Input): Promise<Output>`.
- [x] 3.3 [api/shared/domain] Implement `types/optional.ts` — `Optional<T, K>` utility type as `Pick<Partial<T>, K> & Omit<T, K>`.
- [x] 3.4 [api/shared/domain] Implement `types/pagination.ts` — `Pagination` type with `page: number` and `limit: number`.
- [x] 3.5 [api/shared/domain] Create `types/index.ts` barrel export.

## 4. Errors (zero dependencies)

- [x] 4.1 [api/shared/domain] Implement `errors/use-case-error.ts` — `UseCaseError` type alias `{ message: string }`.
- [x] 4.2 [api/shared/domain] Implement `errors/not-found.ts` — `NotFoundError extends Error implements UseCaseError`, optional message defaulting to `"Resource not found"`. Unit test: default message, custom message, instanceof Error.
- [x] 4.3 [api/shared/domain] Implement `errors/not-allowed.ts` — `NotAllowedError extends Error implements UseCaseError`, fixed message `"Not allowed"`. Unit test: fixed message.
- [x] 4.4 [api/shared/domain] Implement `errors/validation-error.ts` — `ValidationError extends Error` with `errors: { field, message }[]`, `hasErrorForField()`, `getErrorForField()`. Unit test: multiple fields, message construction, field lookup.
- [x] 4.5 [api/shared/domain] Create `errors/index.ts` barrel export.

## 5. Validators (depends on types/either, errors)

- [x] 5.1 [api/shared/domain] Implement `validators/validation-fields-error.ts` — `ValidationFieldsError extends Error` with `errors: { field, message }[]`. Unit test: construction, message.
- [x] 5.2 [api/shared/domain] Implement `validators/validation-strategy.ts` — `ValidationStrategy<T>` interface with `validate(data: T): Either<ValidationFieldsError, void>`.
- [x] 5.3 [api/shared/domain] Implement `validators/zod-validation-strategy.ts` — `ZodValidationStrategy<T>` accepting `z.ZodSchema<T>`, calls `safeParse()`, maps errors to `ValidationFieldsError` with path joining (`.`). Unit test: valid data passes, invalid data returns field errors, nested path joining.
- [x] 5.4 [api/shared/domain] Create `validators/index.ts` barrel export.

## 6. Domain Events (depends on value-objects for Id)

- [x] 6.1 [api/shared/domain] Implement `events/domain-event.ts` — `DomainEvent` interface with `occurredAt: Date` and `getAggregateId(): Id`. Zero framework dependencies.
- [x] 6.2 [api/shared/domain] Implement `events/domain-event-dispatcher.ts` — abstract class `DomainEventDispatcher` with `abstract dispatch(event)` and `abstract dispatchAll(aggregate)`. Must be a class (not interface) for NestJS DI.
- [x] 6.3 [api/shared/domain] Create `events/index.ts` barrel export.

## 7. Entities (depends on value-objects, types, events, validators)

- [x] 7.1 [api/shared/domain] Implement `entities/entity.ts` — abstract `Entity<T>` with `_id: Id`, `createdAt`/`updatedAt` timestamps, `update(Partial<T>)`, `equals()` by identity, `toJSON()`, `abstract validate(): Either<ValidationFieldsError, void>`. Unit test: auto-id, provided id, equality, update bumps timestamp, toJSON shape.
- [x] 7.2 [api/shared/domain] Implement `entities/aggregate-root.ts` — abstract `AggregateRoot<T> extends Entity<T>` with `_domainEvents[]`, `addDomainEvent()` (buffer only, no static registry), `domainEvents` getter, `clearEvents()`. Unit test: accumulate events, clear events, no global side effects.
- [x] 7.3 [api/shared/domain] Implement `entities/watched-list.ts` — abstract `WatchedList<T>` with `abstract compareItems()`, `add()`, `remove()`, `update()`, `getItems()`, `newItems`, `removedItems`. Unit test: track new, track removed, re-add removed, remove newly added, bulk update diff.
- [x] 7.4 [api/shared/domain] Create `entities/index.ts` barrel export.

## 8. NestJS Event Infrastructure (depends on shared/domain/events)

- [x] 8.1 [api/core] Implement `core/events/nestjs-event-dispatcher.ts` — `@Injectable() NestJsEventDispatcher extends DomainEventDispatcher`, injects `EventEmitter2`, `dispatch()` emits with `event.constructor.name`, `dispatchAll()` iterates + clears. Unit test: emits correct event name, dispatches all events, clears aggregate events.
- [x] 8.2 [api/core] Implement `core/events/events.module.ts` — `@Global() @Module()` importing `EventEmitterModule.forRoot()`, providing `{ provide: DomainEventDispatcher, useClass: NestJsEventDispatcher }`, exporting `DomainEventDispatcher`.
- [x] 8.3 [api/core] Create `core/events/index.ts` barrel export.
- [x] 8.4 [api] Register `EventsModule` in `app.module.ts` imports — after `DatabaseModule`, before `AuthModule`.

## 9. Master Barrel and Cleanup

- [x] 9.1 [api/shared/domain] Create `shared/domain/index.ts` master barrel with selective re-exports from all subdirectories.
- [x] 9.2 [api] Verify `turbo check-types` passes with zero errors.
- [x] 9.3 [api] Verify `bun run lint` (Biome) passes on all new files.
- [x] 9.4 [api] Run all unit tests with `bun run --filter @fincheck/api test` and verify they pass.
