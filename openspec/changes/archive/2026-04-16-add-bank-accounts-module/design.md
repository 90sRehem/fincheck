## Context

The backend has a complete DDD infrastructure layer (auth, database, env, events, domain kernel with Entity/AggregateRoot/ValueObject/Either/UseCase) but zero domain modules. The `modules/users/` and `modules/session/` directories are empty scaffolding. This is the first domain module to be implemented, and it sets the architectural pattern for all subsequent modules (categories, transactions, budgets, etc.).

The existing auth system uses better-auth with a table named `accounts` for OAuth providers. The domain concept of bank accounts must use a distinct table name (`bank_accounts`) to avoid collision.

## Goals / Non-Goals

**Goals:**

- Implement the first complete domain module following the established DDD kernel patterns
- Establish the repeatable module structure: domain (entity + validator + type constants) → infra (repository + mapper) → use-cases (one folder per operation) → module registration
- Provide full CRUD for bank accounts scoped to authenticated users
- Create the `bank_accounts` Drizzle schema with proper types, constraints, and indexes

**Non-Goals:**

- Balance recalculation from transactions (future — Transactions module will handle this)
- Domain events / AggregateRoot upgrade (not needed until balance changes trigger side effects)
- Frontend implementation (separate change)
- Multi-currency conversion or exchange rates
- Account archiving / soft delete (simple hard delete for now)

## Decisions

### 1. Entity extends Entity\<T\>, not AggregateRoot\<T\>

**Choice:** Use the simpler `Entity<T>` base class, not `AggregateRoot<T>`.

**Rationale:** AggregateRoot adds domain event tracking (`addDomainEvent`, `clearEvents`). Bank accounts don't emit events yet — no other module listens for account changes. When Transactions are implemented and need to trigger balance recalculation on account changes, BankAccount can be upgraded to AggregateRoot with zero breaking changes (AggregateRoot extends Entity).

**Alternative considered:** Start with AggregateRoot for future-proofing. Rejected because YAGNI — adding unused infrastructure adds cognitive overhead.

### 2. One controller per use case

**Choice:** Each use case gets its own controller file, all using the same `@Controller("bank-accounts")` route prefix.

**Rationale:** NestJS merges routes from multiple controllers with the same prefix. This aligns with the use-case folder structure (`create-bank-account/`, `list-bank-accounts/`, etc.) and keeps each controller single-responsibility. Adding a new operation means adding a new folder — no existing file is modified.

**Alternative considered:** Single `BankAccountsController` with all routes. Rejected because it would grow with every new operation and doesn't match the folder-per-use-case convention.

### 3. Repository as abstract class (not interface)

**Choice:** `BankAccountRepository` is an abstract class with abstract methods.

**Rationale:** NestJS DI requires a class token for `provide:`. TypeScript interfaces are erased at runtime and cannot serve as injection tokens without introducing string/symbol workarounds. Abstract classes provide both the type contract and the DI token.

**Alternative considered:** Symbol token + interface (like `DRIZZLE_DB`). Works but requires separate type import and symbol import at every injection site. Abstract class is cleaner for repository patterns.

### 4. Type constants with `as const` + union (no TS enum)

**Choice:** `BANK_ACCOUNT_TYPE` as `const` object with derived `BankAccountType` union type.

**Rationale:** Project-wide convention — TypeScript enums are prohibited (see AGENTS.md). `as const` objects are tree-shakeable, work with `isolatedModules`, and produce standard union types. PostgreSQL `pgEnum` is used at the database level for data integrity — this is a DB constraint, not a TS enum.

### 5. Dual validation (DTO + entity)

**Choice:** Validate input at two layers — Zod `.parse()` on the HTTP body in the controller, and `entity.validate()` via `ZodValidationStrategy` in the domain layer.

**Rationale:** Defense in depth. The DTO catches malformed HTTP input (missing fields, wrong types). The entity enforces domain invariants (business rules, cross-field constraints). If a use case is called from a non-HTTP context (e.g., event handler, CLI), the entity validation still protects the domain.

### 6. Numeric(12,2) for balances

**Choice:** PostgreSQL `numeric(12,2)` stored as string in DB, converted to `number` in domain via mapper.

**Rationale:** `numeric` avoids floating-point precision issues that `float`/`double` have with currency. Precision 12 supports up to 9,999,999,999.99 — sufficient for personal finance. Drizzle returns `numeric` as strings from PostgreSQL; the mapper handles `parseFloat()` and `.toString()` conversions.

**Alternative considered:** Integer cents (multiply by 100). Simpler but loses readability and requires division on every display. `numeric` is the standard PostgreSQL approach for money.

### 7. All queries scoped by userId

**Choice:** Every repository method that reads or mutates data requires `userId` as a parameter and includes it in the WHERE clause.

**Rationale:** Data isolation — a user must never see or modify another user's bank accounts. The `userId` comes from the authenticated session (`@Session()` decorator), never from the client request body or URL.

## Risks / Trade-offs

- **[Risk] numeric-to-number precision loss** — `parseFloat("0.1") + parseFloat("0.2") !== 0.3`. For display and simple CRUD this is acceptable, but when Transactions are implemented, balance calculations should use a decimal library or stay in string/BigInt form. → **Mitigation:** Document this as a known limitation. When Transactions module is built, evaluate using `decimal.js` or computing balances via SQL aggregation.

- **[Risk] No pagination on list endpoint** — `GET /api/bank-accounts` returns all accounts for a user. → **Mitigation:** Users rarely have more than 10-20 bank accounts. Pagination is unnecessary here but will be critical for Transactions. The `Pagination` type in the DDD kernel is ready when needed.

- **[Risk] Error mapping is inline in controllers** — Each controller manually checks `result.isFailure` and throws NestJS exceptions. → **Mitigation:** Acceptable for the first module with 4 controllers. If the pattern becomes repetitive, extract a shared `ResultHandler` utility or NestJS exception filter.

- **[Trade-off] currentBalance field is redundant until Transactions exist** — It starts equal to `initialBalance` and has no mechanism to change. → **Mitigation:** Include it now so the schema doesn't need migration later. The field is ready for when Transactions are implemented.

## Migration Plan

1. Create the Drizzle schema file (`bank-account-schema.ts`)
2. Run `bun run --filter @fincheck/api db:generate` to generate the SQL migration
3. Run `bun run --filter @fincheck/api db:migrate` to apply
4. Rollback: drop `bank_accounts` table and `bank_account_type` enum type via a down migration or manual SQL

No data migration needed — this is a new table on a greenfield database.

## Open Questions

- Should bank accounts have an `isActive` / `archivedAt` field for soft delete instead of hard delete? Deferred to a future change — hard delete is simpler and sufficient for MVP.
- Should the `color` field have a predefined palette or accept any hex? Current design accepts any valid hex (`#RRGGBB`). A palette could be enforced later via the frontend without schema changes.
