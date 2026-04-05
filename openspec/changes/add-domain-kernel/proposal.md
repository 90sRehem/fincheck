## Why

The `@fincheck/api` backend has a scaffolded but entirely empty `src/shared/domain/` and `src/modules/` structure. Without a domain kernel, every new feature (transactions, bank accounts, categories) will be built ad-hoc, leading to inconsistent patterns and tight coupling to infrastructure. Adding the domain kernel now — before any business logic exists — establishes the foundation that all future modules depend on.

## What Changes

- Implement the shared domain kernel in `src/shared/domain/` with base building blocks: Entity, AggregateRoot, ValueObject, Id, Either monad, WatchedList, domain event interfaces, validation strategy, and domain errors
- Add a hybrid domain event system: pure event accumulation in the domain layer, dispatch via `@nestjs/event-emitter` in infrastructure
- Create `src/core/events/` NestJS module wrapping `EventEmitter2` as the concrete `DomainEventDispatcher`
- Rename scaffolded `validation/` directory to `validators/` and add `errors/` directory
- Install `@nestjs/event-emitter` dependency
- Register `EventsModule` in `AppModule`

## Capabilities

### New Capabilities

- `domain-building-blocks`: Core domain primitives — Entity\<T\> base class with Id/timestamps/validate(), AggregateRoot\<T\> with event buffer, ValueObject\<T\> with structural equality, Id value object (UUID), WatchedList\<T\> for change-tracking collections
- `domain-types`: Functional types — Either\<L,R\> monad with type narrowing, UseCase\<I,O\> interface, Optional\<T,K\> utility type, Pagination type
- `domain-errors`: Error hierarchy — UseCaseError type, NotFoundError, NotAllowedError, ValidationError with field-level details
- `domain-validation`: Validation strategy pattern — ValidationStrategy\<T\> interface, ZodValidationStrategy\<T\> implementation, ValidationFieldsError container
- `domain-events`: Hybrid event system — DomainEvent interface (pure), DomainEventDispatcher abstract class (DI token), NestJsEventDispatcher implementation (EventEmitter2), EventsModule (@Global)

### Modified Capabilities

_(none — no existing specs)_

## Impact

- **Affected app:** `@fincheck/api` only
- **New dependency:** `@nestjs/event-emitter` in `apps/api/package.json`
- **Directory changes:** `src/shared/domain/validation/` renamed to `src/shared/domain/validators/`, new `src/shared/domain/errors/`, new `src/core/events/`
- **AppModule:** Adds `EventsModule` import (before `AuthModule`)
- **No breaking changes** — all existing code (core/auth, core/database, core/env, app.controller) remains untouched
- **No database/schema changes** — pure TypeScript, no migrations needed

## Success Criteria

- All domain kernel files compile with `turbo check-types`
- `biome check` passes with zero errors on new files
- Unit tests pass for: Either monad operations, Id creation/equality, ValueObject equality, Entity creation/validation, AggregateRoot event accumulation/clearing, WatchedList add/remove/diff tracking
- `NestJsEventDispatcher` correctly dispatches accumulated aggregate events via `EventEmitter2`
- `EventsModule` registers as `@Global()` and `DomainEventDispatcher` is injectable across all modules

## Technical Constraints

- NestJS DI requires `abstract class` (not interface) for injection tokens — applies to `DomainEventDispatcher` and future repository ports
- `biome.json` in `apps/api/` has `useImportType: off` — runtime imports required for DI
- `verbatimModuleSyntax: false` in tsconfig (NestJS decorator compatibility)
- Zod v4 is already installed — `ZodValidationStrategy` must use v4 API (`safeParse`, `ZodSchema`)
