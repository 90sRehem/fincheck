## Why

The backend has production-ready infrastructure (auth, database, env, events, DDD kernel) but zero domain logic. All modules (`users`, `session`) are empty scaffolding. RF01 (Contas e Carteiras) is the foundational requirement — every other feature (transactions RF02, categories RF03, budgets RF03, reports RF04) depends on bank accounts existing first. Implementing this module unblocks the entire domain layer and establishes the repeatable pattern for all future modules.

## What Changes

- Add `bank_accounts` PostgreSQL table with Drizzle schema (pgEnum for account type, numeric for balances, FK to users)
- Implement `BankAccount` domain entity following the existing DDD kernel patterns (Entity base class, ZodValidationStrategy, Either monad)
- Create full CRUD: `POST /api/bank-accounts`, `GET /api/bank-accounts`, `PUT /api/bank-accounts/:id`, `DELETE /api/bank-accounts/:id`
- Implement repository pattern with abstract class + Drizzle implementation, mapper (domain <-> persistence <-> response)
- Register `BankAccountsModule` in the root `AppModule`
- All endpoints protected by the existing global auth guard; userId extracted from `@Session()` decorator

## Capabilities

### New Capabilities

- `bank-account-crud`: Create, read, update, and delete bank accounts (checking, savings, credit card, cash, investment) scoped to the authenticated user. Includes balance tracking, currency, and visual customization (color, icon).

### Modified Capabilities

<!-- No existing specs to modify — this is the first domain module -->

## Impact

- **Apps affected:** `api` only (backend)
- **Database:** New `bank_accounts` table + `bank_account_type` pgEnum — requires migration (`db:generate` + `db:migrate`)
- **New module:** `src/modules/bank-accounts/` with 17 files (entity, validator, type constants, repository interface + Drizzle impl, mapper, 4 use-cases, 4 controllers, 2 DTOs, module definition)
- **Modified file:** `src/app.module.ts` — add `BankAccountsModule` import
- **API surface:** 4 new endpoints under `/api/bank-accounts` (all authenticated)
- **Dependencies:** No new npm packages — uses existing Drizzle, Zod, NestJS, better-auth

## Success Criteria

- All 4 CRUD operations work end-to-end (create, list, update, delete)
- Each account is scoped to the authenticated user — no cross-user data leakage
- Domain validation rejects invalid input (empty name, invalid color hex, unknown account type)
- Balance fields stored with 2-decimal precision via `numeric(12,2)`
- Migration runs cleanly on a fresh database
- Type checks pass (`turbo check-types`)

## Technical Constraints

- **No TypeScript enums** — use `as const` objects with derived union types; `pgEnum` in Drizzle is allowed
- **Repository as abstract class** — NestJS DI requires class tokens, not interfaces
- **numeric returns string from PG** — mapper must convert to/from `number` in domain layer
- **Auth tables conflict** — better-auth already has an `accounts` table (OAuth providers); this module uses `bank_accounts` to avoid naming collision
