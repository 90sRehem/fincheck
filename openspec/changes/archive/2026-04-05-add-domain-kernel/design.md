## Context

The `@fincheck/api` has a scaffolded DDD structure (`src/shared/domain/` with 5 empty directories, `src/modules/` with empty use-case folders) but zero domain code. The core infrastructure (auth via better-auth, database via Drizzle, env via Zod) is fully implemented in `src/core/`. This change fills the empty kernel before any business modules are built.

Reference implementation: [easy-list/shared/domain](https://github.com/90sRehem/easy-list/tree/main/apps/api/src/shared/domain) — a NestJS DDD kernel with Entity, AggregateRoot, ValueObject, Either, WatchedList, domain events, and validation strategy. We adapt its patterns while fixing its known gaps (incomplete event dispatch, missing NestJS DI wiring).

## Goals / Non-Goals

**Goals:**

- Provide a complete, tested domain kernel that all future modules depend on
- Establish the hybrid domain event pattern: pure accumulation in domain, framework dispatch in infrastructure
- Keep domain layer zero-dependency on NestJS (only `node:crypto` and Zod type imports)
- Every building block independently unit-testable with Vitest
- Barrel exports at every level for clean import paths

**Non-Goals:**

- No concrete domain entities (Transaction, BankAccount, Category) — those come in future changes
- No concrete repository implementations — only the abstract class pattern is established
- No HTTP controllers or API endpoints
- No database schema changes or migrations
- No CQRS — simple service pattern first
- No async event processing (BullMQ) — in-process EventEmitter2 is sufficient for now

## Decisions

### D1: Abstract class over interface for DI tokens

**Choice:** `DomainEventDispatcher` and future repository ports use `abstract class`, not `interface`.

**Why:** TypeScript interfaces are erased at compile time. NestJS DI needs runtime tokens. Abstract classes survive compilation and serve as both contract and injection token without custom Symbol constants.

**Alternative considered:** Symbol tokens (like existing `DRIZZLE_DB`). Rejected because abstract class is more ergonomic — `@Inject(DomainEventDispatcher)` reads better than `@Inject(DOMAIN_EVENT_DISPATCHER)`, and the type checking is automatic.

### D2: UseCase as interface (not abstract class)

**Choice:** `UseCase<Input, Output>` is a plain TypeScript interface. NestJS services implement it directly.

**Why:** Easy-list uses `abstract class UseCase` with a separate `Service extends UseCase` wrapper — this creates 2 classes per use-case for no practical benefit. With Vitest, we can test NestJS services directly without the full DI container. One class per use-case reduces boilerplate.

**Alternative considered:** Easy-list's abstract class pattern. Rejected due to unnecessary boilerplate and no testing advantage with Vitest.

### D3: No static global event dispatcher

**Choice:** Remove the `DomainEvents` static class from easy-list. AggregateRoot only buffers events.

**Why:** Easy-list's static `DomainEvents.markAggregateForDispatch()` creates a global singleton that is hard to test in parallel and doesn't integrate with NestJS DI. Our hybrid approach lets the Application Service control dispatch timing explicitly.

**Flow:**
1. `AggregateRoot.addDomainEvent(event)` — pushes to internal array
2. Application Service calls `repository.save(aggregate)` — persistence
3. Application Service calls `dispatcher.dispatchAll(aggregate)` — dispatch + clear
4. `NestJsEventDispatcher` emits via `EventEmitter2`
5. `@OnEvent()` listeners in any module react

**Alternative considered:** Easy-list's static pattern. Rejected due to global state, testing difficulties, and no NestJS integration.

### D4: EventEmitter2 as initial event transport

**Choice:** `@nestjs/event-emitter` wrapping `EventEmitter2` for in-process event dispatch.

**Why:** Simplest possible integration with NestJS DI. Supports `@OnEvent()` decorators on any injectable. Wildcard and async support built-in. Clear evolution path to BullMQ or message broker when needed.

**Alternative considered:** Custom in-process pub/sub. Rejected — reinventing what `@nestjs/event-emitter` already provides.

### D5: Validation at two layers with shared Zod

**Choice:** DTO validation (controller) and Entity validation (domain) both use Zod, but through different mechanisms.

**Why:** DTOs validate shape (types, formats, required fields) and return HTTP 400. Entities validate business invariants (sufficient balance, valid date ranges) and return `Either<ValidationFieldsError, void>`. The `ValidationStrategy<T>` interface decouples the domain from Zod — entities call `strategy.validate()`, the strategy happens to use Zod internally.

**Alternative considered:** Validate only at DTO level. Rejected because business invariants belong in the domain, not the presentation layer.

### D6: Entity identity as ValueObject

**Choice:** `Id` extends `ValueObject<string>`, wrapping `crypto.randomUUID()`. Entities store `_id: Id`.

**Why:** Prevents mixing up IDs from different aggregates at the type level. Centralizes UUID generation (swappable to ULID/CUID later). Aligns with Drizzle schema using `text` type for UUIDs. `Id.fromString()` provides safe reconstitution from persistence.

### D7: Directory renaming

**Choice:** Rename `src/shared/domain/validation/` to `src/shared/domain/validators/`. Add `src/shared/domain/errors/`.

**Why:** `validators/` better describes the contents (strategy classes, not validation concepts). `errors/` separates domain error types from validation field errors. Both align with easy-list naming.

## Risks / Trade-offs

**[Risk] Zod v4 API differences** → The `ZodValidationStrategy` uses `safeParse()`. Verify this API is stable in Zod v4 (already installed). Mitigation: Zod v4 maintains `safeParse()` compatibility.

**[Risk] EventEmitter2 swallows errors silently** → If a listener throws, other listeners may not execute. Mitigation: Listeners should catch their own errors. Document this in the EventsModule.

**[Risk] Domain kernel becomes too abstract too early** → Building blocks without concrete entities may drift from actual needs. Mitigation: The kernel is adapted from a proven reference (easy-list). First concrete module (transactions) will validate the patterns immediately after this change.

**[Trade-off] No event persistence** → Domain events are in-memory only. Lost on crash. Acceptable for a personal finance app. Evolution path: add event store later if needed.

**[Trade-off] Synchronous event dispatch** → `EventEmitter2` runs listeners in the same process/thread. For balance recalculation or notification sending, this is fine. If a listener becomes slow, extract to BullMQ queue.
