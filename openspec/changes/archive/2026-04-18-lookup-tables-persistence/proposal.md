# Proposal: Lookup Tables Persistence (colors + account_types)

## Summary

Migrate `colors` and `account_types` from static in-memory constants to PostgreSQL lookup tables managed via Drizzle ORM. Populate initial data via a seed script. This replaces the previous `colors-endpoint` plan (static controller-only approach) with a database-backed design that enables future CRUD and admin management.

## Motivation

1. **Extensibility** — Colors and account types are currently hardcoded. Persisting them allows future incremental additions via seed or admin CRUD without code deploys.
2. **Referential integrity** — With lookup tables, `bank_accounts.color` and `bank_accounts.type` can eventually reference foreign keys, ensuring data consistency.
3. **Single source of truth** — The database becomes the canonical source, eliminating drift between frontend expectations and backend static arrays.
4. **Consistency** — Both resources follow the same DDD patterns as existing modules (`bank-accounts`, `transactions`, `balances`).

## Supersedes

This change **replaces** `openspec/changes/colors-endpoint/` which planned a static controller-only approach with no database persistence.

## Key Decisions

### 1. Two separate tables: `colors` and `account_types`

Both are global lookup tables (not per-user). They share a similar shape (`id`, `name`) but serve different domains. `colors` adds a `hex` column for the hex color code.

**Rationale:** Keeping them separate rather than a generic "lookups" table provides clearer schema semantics, allows independent migration, and avoids a "type" discriminator column.

### 2. Seed via standalone script, not migration

Seed data is inserted via `apps/api/src/core/database/seed.ts` executed with `tsx`. A new `db:seed` npm script is added to `package.json`.

**Rationale:**
- Migrations should be schema-only (DDL), not data (DML) — this is a Drizzle best practice.
- Seeds are idempotent (upsert via `ON CONFLICT DO NOTHING`), safe to re-run.
- Separating seed from migration allows re-seeding without re-running migrations.

### 3. Colors module: full DDD structure

A new `modules/colors/` module with the standard DDD layers: `domain/` (entity, repository port, use-case), `application/` (service), `presentation/` (controller), `infra/` (Drizzle schema, concrete repository, mapper).

**Rationale:** Even though colors are simple, following the established pattern ensures consistency and makes it trivial to add CRUD later.

### 4. Account types: refactor existing `list-account-types` to use repository

The existing `ListAccountTypesController` in `bank-accounts` module currently serves a static `ACCOUNT_TYPE_LABELS` map. It will be refactored to:
- Add an `AccountTypeRepository` abstract class (port) in `bank-accounts/domain/repositories/`
- Add a use-case `ListAccountTypesUseCase` in `bank-accounts/domain/use-cases/`
- Add a service `ListAccountTypesService` in `bank-accounts/application/`
- Add a Drizzle schema for `account_types` table in `bank-accounts/infra/drizzle/schemas/`
- Add a concrete `DrizzleAccountTypeRepository` in `bank-accounts/infra/persistence/`
- Refactor the controller to inject the service

**Rationale:** Account types belong to the `bank-accounts` bounded context — no need for a separate module. The refactor aligns with the existing DDD pattern.

### 5. Response shape preserved: `{ id: string; name: string }[]`

Both endpoints continue returning `{ id: string; name: string }[]` to maintain frontend compatibility. Colors adds `hex` to the response shape: `{ id: string; name: string; hex: string }[]`.

**Rationale:**
- Frontend `Color` type is `{ id: string; name: string }` — but the `id` currently maps to color name (e.g., `"gray"`). With DB persistence, `id` becomes a UUID. The `name` field carries the color name.
- **Breaking change consideration:** The frontend uses `color.id` as the lookup key for icon components via `getColorIcon()`. With UUID ids, the frontend needs `color.name` (lowercase) for icon lookup. Since the frontend code is in-scope for this project, this is acceptable — the frontend consumer will be updated in a separate change.
- **Alternative chosen:** Keep `id` as the color name string (not UUID) for colors and account types. These are system-defined lookup values, not user-created entities. Using the name as the primary key (`text`) avoids the need for frontend changes and makes the API more readable.

### 6. IDs: deterministic text keys, not UUIDs

Colors use the lowercase name as PK (e.g., `"gray"`, `"indigo"`). Account types use the existing string values as PK (e.g., `"checking"`, `"savings"`).

**Rationale:** These are system-defined constants, not user-generated data. Deterministic keys make seeding idempotent, API responses readable, and eliminate the need for UUID generation on fixed data. The `bank_accounts` table already stores `color` as `text` and `type` via `pgEnum` — the lookup tables serve as the reference source.

### 7. Auth-protected (default)

Both endpoints remain behind the global auth guard. No `@AllowAnonymous()`.

## Scope

**In scope:**
- Drizzle schema for `colors` table (id text PK, name text, hex text)
- Drizzle schema for `account_types` table (id text PK, name text)
- Seed script with 15 colors + 5 account types
- `db:seed` npm script
- New `colors` module with full DDD (entity, repo, use-case, service, controller, infra)
- Refactor `bank-accounts` module: add `AccountTypeRepository`, use-case, service for `list-account-types`
- Schema registry + drizzle config updates
- Swagger schema additions

**Out of scope:**
- Color/account type CRUD endpoints (future change)
- Foreign key constraints from `bank_accounts` to lookup tables (would require migration of existing data)
- Frontend changes to consume the updated API
- Removing the `bankAccountTypeEnum` pgEnum (backward compat — keep for now)

## Risks

- **Migration required:** Adding tables requires `db:generate` + `db:migrate`. Low risk — additive DDL only.
- **Seed idempotency:** Using `ON CONFLICT DO NOTHING` ensures safe re-runs. Tested pattern.
- **Refactor scope on bank-accounts:** Touching the `list-account-types` controller is low-risk since it has no tests and no external consumers beyond the frontend.

## Frontend Contract

```typescript
// GET /api/colors → Color[]
type Color = { id: string; name: string; hex: string };

// GET /api/account_types → AccountType[]
type AccountType = { id: string; name: string };
```
