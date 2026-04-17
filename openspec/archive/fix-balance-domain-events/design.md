## Context

The `create-bank-account` flow follows a DDD pattern: use-case creates entity → adds domain event → persists via repository → service dispatches events. The bug is in the handoff: the repository's `create()` method returns a **new** entity instance reconstructed from the DB row (via `BankAccountMapper.toDomain`), which has an empty `_domainEvents` array. The use-case returns this new instance, so the service dispatches zero events.

Current flow:
```
UseCase.execute()
  → new BankAccount(props, id)        // entity with events capacity
  → bankAccount.addDomainEvent(...)   // event attached to THIS instance
  → repo.create(bankAccount)          // persists, returns NEW instance from mapper
  → return success(created)           // 'created' has no events
Service.execute()
  → super.execute(input)              // gets eventless entity
  → dispatcher.dispatchAll(result.value)  // dispatches nothing
```

Secondary issues: `BalanceMapper` has incorrect `createdAt` mapping, dead code, and unreachable branches. The `@OnEvent` decorator uses `BankAccountCreatedEvent.name` which is fragile (minification, class renaming).

## Goals / Non-Goals

**Goals:**
- Domain events survive the persistence round-trip and reach listeners
- `BalanceMapper` correctly handles the absence of `created_at` in the balances table
- Remove dead code from `BalanceMapper`
- Harden event name binding with a static constant

**Non-Goals:**
- Adding `created_at` column to the `balances` table
- Changing the repository interface contract
- Refactoring the service-extends-use-case pattern
- Adding integration tests for the full event flow (separate change)

## Decisions

### D1: Return original entity from use-case, not repository result

**Decision**: Change `create-bank-account.use-case.ts` line 57-59 to persist via `this.bankAccountRepository.create(bankAccount)` but return `success(bankAccount)` (the original instance) instead of `success(created)`.

**Rationale**: This is the minimal, lowest-risk fix. The original entity has the domain events attached. The repository call still validates persistence succeeded (throws on failure). The returned entity has the same ID and props — the only difference is it carries the events.

**Alternative considered**: Override `execute()` in the service to capture the entity before `super.execute()`. Rejected because it would require duplicating entity construction logic or exposing internals of the use-case.

**Alternative considered**: Make the repository transfer events from the input entity to the output entity. Rejected because repositories should not know about domain events — that's an aggregate root concern.

### D2: Omit createdAt in BalanceMapper.toDomain

**Decision**: Remove `createdAt: raw.updatedAt` from the `toDomain` call. The `Entity` base class constructor (line 18) already defaults `createdAt: props.createdAt ?? new Date()`.

**Rationale**: Using `updatedAt` as `createdAt` is semantically wrong and misleading. A `new Date()` default is more honest — it signals "we don't track creation time for balances." If creation time matters later, the proper fix is adding a column.

### D3: Static event name constant

**Decision**: Add `static readonly eventName = "BankAccountCreatedEvent"` to the event class. Use `BankAccountCreatedEvent.eventName` in the `@OnEvent` decorator.

**Rationale**: `ClassName.name` returns the runtime class name, which can change under minification or bundling. A static string constant is explicit and refactor-safe.

### D4: Remove dead code and unreachable branches

**Decision**: Delete `toAggregatedResponse` method and the `typeof === "string"` branch in `toDomain`.

**Rationale**: `toAggregatedResponse` is never called (grep confirms 1 match — its own definition). The `amountCents` field is typed `number` by Drizzle's `bigint({ mode: "number" })`, making the string branch unreachable.

## Risks / Trade-offs

- **[Risk] Returning pre-persistence entity may have stale DB-generated fields** → Mitigated: `bank_accounts` uses app-generated UUIDs and timestamps, not DB defaults. The entity props are identical pre/post persistence.
- **[Risk] `new Date()` default for balance `createdAt` is imprecise** → Acceptable: the balance is created moments after the mapper runs. If precision matters, add a `created_at` column (out of scope).
- **[Risk] Removing `toAggregatedResponse` breaks future callers** → Mitigated: grep shows zero callers. If needed later, it can be re-added.
