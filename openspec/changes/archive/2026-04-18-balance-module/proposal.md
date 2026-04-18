## Why

The frontend already calls `GET /api/balances/:userId` expecting `{ amountCents, currency }[]`, but no backend endpoint exists. The current `bank_accounts` table stores a `currentBalance` column that is redundant — it starts equal to `initialBalance` and has no mechanism to change. The balance should be a separate concern: a dedicated `balances` table initialized when a bank account is created, ready to be updated by future transaction events. This also requires promoting `BankAccount` from `Entity` to `AggregateRoot` and wiring domain event dispatch so the balances module reacts to `BankAccountCreatedEvent`.

Additionally, the frontend `accounts.ts` calls `api/accounts?userId=...` instead of the correct `api/bank-accounts` endpoint (session-based, no userId param). This mismatch must be fixed.

## What Changes

- **New `balances` module** — full DDD stack (schema, entity, repository, use-case, controller, event listener) providing `GET /api/balances` scoped to authenticated user
- **Promote `BankAccount` to `AggregateRoot`** — change base class, emit `BankAccountCreatedEvent` on creation
- **Add `BankAccountCreatedEvent`** in `shared/domain/events/` as a cross-module event
- **Wire event dispatch** in `CreateBankAccountService` — call `dispatcher.dispatchAll(aggregate)` after persist
- **Remove `currentBalance`** from `bank_accounts` schema, entity, validator, mapper, and DTOs — generate migration
- **Fix frontend route mismatch** — `accounts.ts` URL and types aligned with actual backend API

## Capabilities

### New Capabilities

- `balance-query`: Query aggregated balances per currency for the authenticated user. Creates a balance row per bank account on creation. Returns `{ amountCents, currency }[]` grouped by currency.

### Modified Capabilities

- `bank-account-crud`: Remove `currentBalance` field from schema/entity/response. Promote entity to AggregateRoot with event emission on create. No behavioral change to existing CRUD endpoints beyond the field removal.

## Impact

- **Apps affected:** `api` (new module + schema changes), `web` (fix API URL + types)
- **Database:** New `balances` table, migration to drop `current_balance` column from `bank_accounts`
- **New module:** `src/modules/balances/` with full DDD layers (~15 files)
- **Modified files:**
  - `bank-account.entity.ts` — extends `AggregateRoot` instead of `Entity`
  - `bank-account-schema.ts` — remove `currentBalance` column
  - `bank-account.validator.ts` — remove `currentBalance` from props/schema
  - `bank-account.mapper.ts` — remove `currentBalance` from all mappings
  - `create-bank-account.use-case.ts` — emit `BankAccountCreatedEvent`
  - `create-bank-account.service.ts` — inject `DomainEventDispatcher`, dispatch after persist
  - `schema-registry.ts` — add balance schema
  - `app.module.ts` — add `BalancesModule`
  - `apps/web/src/pages/home/api/accounts.ts` — fix URL and types
- **New cross-module event:** `BankAccountCreatedEvent` in `shared/domain/events/`
- **Dependencies:** None new — `@nestjs/event-emitter` already installed

## Success Criteria

- `GET /api/balances` returns `{ amountCents, currency }[]` for authenticated user
- Creating a bank account automatically creates a corresponding balance row (via event)
- `currentBalance` column no longer exists in `bank_accounts` table
- Frontend `accounts.ts` calls correct endpoint and types match backend response
- All existing bank account CRUD operations continue working
- `turbo check-types` passes across entire monorepo
- `bun run lint` clean on all new/modified files

## Technical Constraints

- **Database migration order matters** — drop `current_balance` column and create `balances` table in same or sequential migrations
- **Event dispatch is async** — balance row creation happens after bank account persist; if listener fails, bank account still exists (eventual consistency)
- **`amountCents` is bigint** — stored as `bigint` in PostgreSQL, returned as string by Drizzle, converted to number in mapper. For personal finance scale this is safe (no overflow risk)
- **Balance grouping** — `GET /api/balances` aggregates by currency using SQL `SUM()` + `GROUP BY`, not in-memory
- **Auth scoping** — balance endpoint uses `@Session()` userId, not URL param (despite frontend currently passing userId in URL — backend ignores it and uses session)
