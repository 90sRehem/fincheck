## 1. Fix Domain Event Dispatch (Critical)

- [x] 1.1 [api/bank-accounts/domain] Return original entity from `CreateBankAccountUseCase.execute()`
  **File**: `apps/api/src/modules/bank-accounts/domain/use-cases/create-bank-account.use-case.ts`
  **Change**: Line 57-59 — keep `await this.bankAccountRepository.create(bankAccount)` for persistence but return `success(bankAccount)` instead of `success(created)`. The repository call still validates persistence (throws on failure). Assign to `await` without capturing return: `await this.bankAccountRepository.create(bankAccount); return success(bankAccount);`
  **Acceptance**: `result.value.domainEvents.length === 1` after `execute()` returns success. The returned entity is the same instance that had `addDomainEvent()` called on it.

- [x] 1.2 [api/shared/events] Add static `eventName` to `BankAccountCreatedEvent`
  **File**: `apps/api/src/shared/domain/events/bank-account-created.event.ts`
  **Change**: Add `static readonly eventName = "BankAccountCreatedEvent";` as the first property of the class (line 5).
  **Acceptance**: `BankAccountCreatedEvent.eventName === "BankAccountCreatedEvent"` — a string literal, not dependent on runtime class name.

- [x] 1.3 [api/balances/application] Use static `eventName` in listener decorator
  **File**: `apps/api/src/modules/balances/application/on-bank-account-created/on-bank-account-created.listener.ts`
  **Change**: Line 12 — replace `@OnEvent(BankAccountCreatedEvent.name)` with `@OnEvent(BankAccountCreatedEvent.eventName)`.
  **Acceptance**: The `@OnEvent` decorator uses the static string constant. Grep for `.name)` in this file returns zero matches.

## 2. Fix BalanceMapper

- [x] 2.1 [api/balances/infra] Remove incorrect `createdAt` mapping in `BalanceMapper.toDomain`
  **File**: `apps/api/src/modules/balances/infra/mappers/balance.mapper.ts`
  **Change**: Line 25 — delete `createdAt: raw.updatedAt,` from the `toDomain` constructor call. The `Entity` base class defaults `createdAt` to `new Date()` when not provided.
  **Acceptance**: `BalanceMapper.toDomain(raw)` produces a `Balance` where `createdAt` is NOT equal to `raw.updatedAt`.

- [x] 2.2 [api/balances/infra] Remove unreachable `typeof === "string"` branch for `amountCents`
  **File**: `apps/api/src/modules/balances/infra/mappers/balance.mapper.ts`
  **Change**: Lines 20-23 — replace the ternary `typeof raw.amountCents === "string" ? Number.parseInt(raw.amountCents, 10) : raw.amountCents` with just `raw.amountCents`. Drizzle types this as `number`.
  **Acceptance**: No `parseInt` or `typeof` check in `toDomain`. The `amountCents` property is assigned directly from `raw.amountCents`.

- [x] 2.3 [api/balances/infra] Remove dead `toAggregatedResponse` method
  **File**: `apps/api/src/modules/balances/infra/mappers/balance.mapper.ts`
  **Change**: Delete lines 43-54 (the entire `static toAggregatedResponse` method). Also remove the `AggregatedBalance` import on line 1 if it becomes unused.
  **Acceptance**: Grep for `toAggregatedResponse` across the codebase returns zero matches. The `BalanceMapper` class has only `toDomain` and `toPersistence` methods.

## 3. Verification

- [x] 3.1 [api] Type check passes
  **Command**: `turbo check-types --filter=@fincheck/api`
  **Acceptance**: Exit code 0, no type errors.

- [x] 3.2 [api] Existing tests pass
  **Command**: `bun run --filter @fincheck/api test`
  **Acceptance**: All existing tests pass. No regressions.

- [x] 3.3 [api] Lint passes
  **Command**: `bun run lint`
  **Acceptance**: No new lint errors introduced by the changes.
