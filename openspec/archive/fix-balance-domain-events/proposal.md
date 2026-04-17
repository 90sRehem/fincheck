## Why

Domain events added to `BankAccount` during creation are silently lost because the repository returns a **new entity instance** (via `BankAccountMapper.toDomain`) with an empty `_domainEvents` array. The service dispatches from this eventless instance, so `OnBankAccountCreatedListener` never fires and initial balances are never created. This is a critical data integrity bug — every new bank account is missing its initial balance record.

Secondary issues in the balance module compound the problem: `BalanceMapper` maps `createdAt` from `updatedAt` (the table has no `created_at` column), contains dead code (`toAggregatedResponse`), and uses a fragile event name binding (`BankAccountCreatedEvent.name`).

## What Changes

- **Fix domain event dispatch**: Change `create-bank-account.use-case.ts` to return the original entity (with events attached) instead of the repository-returned entity
- **Fix BalanceMapper.createdAt**: Remove incorrect `createdAt: raw.updatedAt` mapping; let `Entity` base class default it
- **Remove dead code**: Delete `BalanceMapper.toAggregatedResponse` (never called; use-case has inline aggregation)
- **Remove dead branch**: Remove unreachable `typeof === "string"` check on `amountCents` (Drizzle types it as `number`)
- **Harden event name**: Add `static readonly eventName` to `BankAccountCreatedEvent` and use it in the `@OnEvent` decorator

## Capabilities

### New Capabilities

_None — this is a bug fix change._

### Modified Capabilities

- `domain-event-dispatch`: Fix the event lifecycle so domain events survive repository persistence and reach listeners
- `balance-mapping`: Correct the `BalanceMapper` to handle missing `created_at` column properly and remove dead code

## Impact

- **Affected app**: `apps/api` only
- **Files** (6 files):
  - `modules/bank-accounts/domain/use-cases/create-bank-account.use-case.ts` — return original entity
  - `modules/balances/infra/mappers/balance.mapper.ts` — fix createdAt, remove dead code/branch
  - `shared/domain/events/bank-account-created.event.ts` — add static eventName
  - `modules/balances/application/on-bank-account-created/on-bank-account-created.listener.ts` — use static eventName
- **No schema/migration changes**: All fixes are in application/domain code
- **No API contract changes**: Response shapes unchanged
- **Risk**: Low — fixes are isolated to event dispatch plumbing and mapper internals

## Success Criteria

- Creating a bank account dispatches `BankAccountCreatedEvent` to the event bus
- `OnBankAccountCreatedListener` receives the event and creates a balance record
- `BalanceMapper.toDomain` does not set `createdAt` from `updatedAt`
- No dead code remains in `BalanceMapper`
- `@OnEvent` uses a static string constant, not `.name`
- `turbo check-types` passes
- Existing tests pass (`bun run --filter @fincheck/api test`)

## Technical Constraints

- Must not change the `BankAccountRepository.create` return type contract (still returns `BankAccount`)
- Must not add a `created_at` column to the `balances` table (out of scope)
- Must preserve the service-extends-use-case pattern
