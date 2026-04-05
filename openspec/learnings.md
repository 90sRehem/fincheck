# Domain Layer — Architectural Decisions

Consolidation of exploration session on adding a strategic DDD domain layer to `@fincheck/api`.
Reference implementation: [easy-list/shared/domain](https://github.com/90sRehem/easy-list/tree/main/apps/api/src/shared/domain)

---

## Current State

- `src/shared/domain/` exists but is **100% empty scaffolding** (5 empty directories: entities/, events/, types/, validation/, value-objects/)
- `src/modules/` has **zero files** — only empty directory structure for users/ and session/
- `src/core/` is **fully implemented** (auth, database, env)
- No event infrastructure installed (`@nestjs/event-emitter` not in dependencies)
- No domain entities, value objects, or use-cases exist yet

## Reference: easy-list Domain Kernel

The easy-list project provides a complete DDD shared kernel with:

| Building Block | File | Description |
|---|---|---|
| `Entity<T>` | `entities/entity.ts` | Abstract base with `Id`, timestamps, `update(Partial<T>)`, `abstract validate(): Either` |
| `AggregateRoot<T>` | `entities/aggregate-root.ts` | Extends Entity, adds domain event buffer + static dispatcher registration |
| `WatchedList<T>` | `entities/watched-list.ts` | Change-tracking collection (tracks new/removed/current items) |
| `ValueObject<T>` | `value-objects/value-object.ts` | Immutable, structural equality |
| `Id` | `value-objects/id.ts` | Extends ValueObject\<string\>, wraps `crypto.randomUUID()` |
| `DomainEvent` | `events/domain-event.ts` | Interface: `occurredAt`, `getAggregateId()` |
| `DomainEvents` | `events/domain-events.ts` | **Static** in-memory dispatcher/registry (singleton pattern) |
| `EventHandler` | `events/event-handler.ts` | Interface: `setupSubscriptions()` |
| `Either<L,R>` | `types/either.ts` | `IsFailure \| IsSuccess` with type narrowing via `this is` |
| `UseCase<I,O>` | `types/use-case.ts` | Abstract class with `execute(input): Promise<Output>` |
| `Optional<T,K>` | `types/optional.ts` | Makes selected keys optional |
| `Pagination` | `types/pagination.ts` | `{ page, limit }` |
| `UseCaseError` | `errors/use-case-error.ts` | Type: `{ message: string }` |
| `NotAllowedError` | `errors/not-allowed.ts` | Extends Error implements UseCaseError |
| `NotFoundError` | `errors/not-found.ts` | Extends Error implements UseCaseError |
| `ValidationStrategy<T>` | `validators/validation-strategy.ts` | Strategy pattern interface for pluggable validation |
| `ZodValidationStrategy<T>` | `validators/zod-validation-strategy.ts` | Zod-based implementation |
| `ValidationFieldsError` | `validators/validation-fields-error.ts` | Field-level error container |
| Cryptography abstractions | `cryptography/` | Encrypter, HashComparer, HashGenerator (abstract classes) |

### Known gaps in easy-list

- Repository implementations **never call** `DomainEvents.dispatchEventsForAggregate()` — dispatch is incomplete
- Event subscribers are **never instantiated** by any NestJS module — DI wiring is missing
- The `Service extends UseCase` pattern creates boilerplate (2 classes per use-case)

---

## Decisions Made

### 1. What to Port from easy-list

| Building Block | Port? | Adaptation |
|---|---|---|
| `Entity<T>` | YES | Keep as-is: `_id: Id`, timestamps, `abstract validate(): Either` |
| `AggregateRoot<T>` | YES | **Remove** `DomainEvents.markForDispatch()` — no static global dispatcher |
| `WatchedList<T>` | YES | Keep as-is — universal, no dependencies |
| `ValueObject<T>` | YES | Keep as-is |
| `Id` | YES | Keep as-is — aligns with `text` UUID in Drizzle schema |
| `Either<L,R>` | YES | Keep as-is |
| `UseCase<I,O>` | YES | **Change from abstract class to interface** — NestJS Service implements directly |
| `Optional<T,K>` | YES | Keep as-is |
| `Pagination` | YES | Keep as-is |
| `ValidationStrategy<T>` | YES | Keep as-is — decouples Zod from domain |
| `ZodValidationStrategy<T>` | YES | Keep as-is |
| `ValidationFieldsError` | YES | Keep as-is |
| `UseCaseError`, `NotAllowedError`, `NotFoundError` | YES | Keep as-is |
| `DomainEvents` (static dispatcher) | NO | Replaced by `DomainEventDispatcher` abstract class + NestJS implementation |
| `EventHandler` interface | NO | NestJS `@OnEvent()` decorator replaces this |
| Cryptography abstractions | NO | better-auth handles all auth/hash/jwt |

### 2. Domain Events — Hybrid Architecture

**Core principle:** Events are pure in the domain, dispatched via framework in infrastructure.

- `AggregateRoot` accumulates events via `addDomainEvent(event)` — **no static registry**, just a buffer
- `DomainEventDispatcher` is an **abstract class** in `shared/domain/events/` (serves as NestJS DI token)
- `NestJsEventDispatcher` in `core/events/` implements it using `EventEmitter2`
- **Application Service** (NestJS `@Injectable()`) calls `dispatcher.dispatchAll(aggregate)` after successful persistence
- **Repository knows nothing about events** — only persists, stays pure

```
AggregateRoot.addDomainEvent(event)     ← domain (pure, just buffers)
    ↓
Service calls repository.save(aggregate) ← application (NestJS)
    ↓
Service calls dispatcher.dispatchAll(aggregate)  ← application (NestJS)
    ↓
NestJsEventDispatcher → EventEmitter2.emit()     ← infrastructure
    ↓
@OnEvent() listeners in other modules             ← infrastructure
```

### 3. Event Location

- **DomainEvent interface** → `shared/domain/events/domain-event.ts`
- **DomainEventDispatcher abstract class** → `shared/domain/events/domain-event-dispatcher.ts`
- **Module-internal events** → `modules/<context>/domain/events/` (e.g., events only the transactions module cares about)
- **Cross-module events** → `shared/domain/events/` (e.g., `TransactionCreatedEvent` that balance module listens to)

### 4. UseCase as Interface (not abstract class)

```typescript
// shared/domain/types/use-case.ts
export interface UseCase<Input, Output> {
  execute(input: Input): Promise<Output>;
}

// modules/transactions/create-transaction/create-transaction.service.ts
@Injectable()
export class CreateTransactionService
  implements UseCase<CreateTransactionInput, Either<TransactionError, TransactionOutput>> {
  constructor(
    private readonly transactionRepo: TransactionRepository,
    private readonly eventDispatcher: DomainEventDispatcher,
  ) {}
  async execute(input) { /* ... */ }
}
```

No intermediate class. Service implements the UseCase interface directly. Reduces boilerplate from 2 classes to 1 per use-case.

### 5. Repository as Abstract Class (DI token)

```typescript
// modules/transactions/domain/transaction.repository.ts
export abstract class TransactionRepository {
  abstract findById(id: string): Promise<Transaction | null>;
  abstract save(transaction: Transaction): Promise<void>;
  abstract delete(id: string): Promise<void>;
}
```

Abstract class survives TypeScript compilation and works as NestJS injection token without custom symbols. Consistent with existing `DRIZZLE_DB` pattern but without needing a Symbol constant.

### 6. Validation — Two Layers

| Layer | Tool | Validates | Returns |
|---|---|---|---|
| **DTO (controller)** | Zod schema | Shape: types, required fields, formats | 400 Bad Request |
| **Entity (domain)** | `ValidationStrategy<T>` + `ZodValidationStrategy` | Business invariants: sufficient balance, valid dates, ownership | `Either<ValidationFieldsError, void>` |

Both use Zod, but at different layers for different purposes. The Entity's `validate()` is called by the Application Service, which decides the HTTP status based on the Either result.

### 7. Naming Conventions

| Scaffolded (current) | Final name | Reason |
|---|---|---|
| `validation/` | `validators/` | Aligns with easy-list, clearer purpose |
| — (missing) | `errors/` | New directory for domain errors |

### 8. Domain Modeling

- **Transaction** = AggregateRoot (main aggregate of the system)
- **BankAccount** = AggregateRoot
- **Category** = Entity (not aggregate — simpler lifecycle)
- **User** = Managed by better-auth, may have a domain wrapper entity for domain-specific concerns
- **WatchedList** use cases: tags on transactions, subcategories, any collection child entities

### 9. Dependencies to Install

```bash
bun add --filter @fincheck/api @nestjs/event-emitter
```

No other new dependencies needed. Zod already installed. `node:crypto` is built-in.

---

## Target Directory Structure

```
src/shared/domain/
├── entities/
│   ├── entity.ts                      # Entity<T> base — Id, timestamps, abstract validate()
│   ├── aggregate-root.ts              # AggregateRoot<T> — event buffer (no static dispatcher)
│   ├── watched-list.ts                # WatchedList<T> — change tracking
│   └── index.ts
├── value-objects/
│   ├── value-object.ts                # ValueObject<T> — immutable, structural equality
│   ├── id.ts                          # Id extends ValueObject<string> — UUID
│   └── index.ts
├── events/
│   ├── domain-event.ts                # DomainEvent interface
│   ├── domain-event-dispatcher.ts     # abstract class DomainEventDispatcher (DI token)
│   └── index.ts
├── types/
│   ├── either.ts                      # Either<L,R> monad
│   ├── use-case.ts                    # UseCase<I,O> interface
│   ├── optional.ts                    # Optional<T,K> utility type
│   ├── pagination.ts                  # { page, limit }
│   └── index.ts
├── errors/
│   ├── use-case-error.ts              # UseCaseError type
│   ├── not-found.ts                   # NotFoundError
│   ├── not-allowed.ts                 # NotAllowedError
│   ├── validation-error.ts            # ValidationError with field details
│   └── index.ts
├── validators/
│   ├── validation-strategy.ts         # ValidationStrategy<T> interface
│   ├── zod-validation-strategy.ts     # ZodValidationStrategy<T>
│   ├── validation-fields-error.ts     # ValidationFieldsError
│   └── index.ts
└── index.ts                           # Master barrel

src/core/events/                       # NEW module
├── events.module.ts                   # @Global() module wrapping EventEmitterModule.forRoot()
├── nestjs-event-dispatcher.ts         # NestJsEventDispatcher implements DomainEventDispatcher
└── index.ts
```

## Implementation Order

Suggested bottom-up order (each step is independently testable):

1. **`shared/domain/value-objects/`** — ValueObject, Id (zero dependencies)
2. **`shared/domain/types/`** — Either, UseCase interface, Optional, Pagination (zero dependencies)
3. **`shared/domain/errors/`** — UseCaseError, NotFound, NotAllowed, ValidationError
4. **`shared/domain/validators/`** — ValidationStrategy, ZodValidationStrategy, ValidationFieldsError (depends on types/either and errors/)
5. **`shared/domain/entities/`** — Entity, AggregateRoot, WatchedList (depends on value-objects/, types/, events/, validators/)
6. **`shared/domain/events/`** — DomainEvent interface, DomainEventDispatcher abstract class
7. **`core/events/`** — NestJsEventDispatcher, EventsModule (NestJS infra, depends on shared/domain/events/)
8. **Barrel exports** — index.ts at each level

## Key Patterns to Follow

### AggregateRoot (simplified vs easy-list)

```typescript
// What easy-list does (DON'T copy the static part):
addDomainEvent(event) {
  this._domainEvents.push(event);
  DomainEvents.markAggregateForDispatch(this); // ← SKIP THIS
}

// What fincheck should do:
addDomainEvent(event: DomainEvent): void {
  this._domainEvents.push(event);
  // Nothing else. Service calls dispatcher.dispatchAll(this) after persist.
}
```

### Application Service (dispatch flow)

```typescript
@Injectable()
export class CreateTransactionService implements UseCase<Input, Either<Error, Output>> {
  constructor(
    private readonly transactionRepo: TransactionRepository,
    private readonly categoryRepo: CategoryRepository,
    private readonly eventDispatcher: DomainEventDispatcher,
  ) {}

  async execute(input: Input): Promise<Either<Error, Output>> {
    // 1. Resolve dependencies (e.g., create category if needed)
    // 2. Create aggregate: const tx = Transaction.create({...})
    //    → internally calls addDomainEvent(TransactionCreatedEvent)
    // 3. Validate: const result = tx.validate()
    //    → if failure, return failure(result.value)
    // 4. Persist: await this.transactionRepo.save(tx)
    // 5. Dispatch: await this.eventDispatcher.dispatchAll(tx)
    // 6. Return success
  }
}
```

### NestJS Module Registration

```typescript
// transactions.module.ts
@Module({
  controllers: [CreateTransactionController],
  providers: [
    CreateTransactionService,
    { provide: TransactionRepository, useClass: DrizzleTransactionRepository },
  ],
})
export class TransactionsModule {}

// app.module.ts — add EventsModule before domain modules
@Module({
  imports: [
    ConfigModule.forRoot({ ... }),
    EnvModule,
    DatabaseModule,
    EventsModule,        // ← NEW: before domain modules
    AuthModule,
    TransactionsModule,  // ← domain modules after infra
  ],
})
export class AppModule {}
```

## Skills to Load During Implementation

- `nestjs-ddd` — Entity/VO templates, use-case folder pattern, module conventions
- `nestjs-modular-monolith` — Module boundaries, event communication, state isolation
- `fincheck-database` — Drizzle schema conventions, migration workflow, DI patterns
- `fincheck-code-quality` — Biome rules, TypeScript strict patterns, naming conventions
- `coding-guidelines` — General coding guidelines for implementation quality
