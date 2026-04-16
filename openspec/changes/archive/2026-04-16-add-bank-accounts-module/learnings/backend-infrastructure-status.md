# Backend Infrastructure Status

## Context

Mapped what is currently implemented vs scaffolded in the backend to determine the next feature to build. The goal was to compare the requirements doc (`docs/1759610610-01-requisitos.md`) against actual code to identify gaps.

## Findings

### Implemented Infrastructure (Production-Ready)

- **Auth module** (`apps/api/src/core/auth/`) — better-auth with Drizzle PG adapter, email+password enabled, cookie session cache (5 min), UUIDv4 IDs, openAPI plugin. Configured in `auth.config.ts:8` via `createAuthConfig()`. Global guard via `AuthModule.forRoot()` — all routes protected by default.
- **Database module** (`apps/api/src/core/database/`) — `@Global()` module, Drizzle + `pg` Pool, injected via `DRIZZLE_DB` symbol token (`constants.ts:1`). Connection factory in `connection.ts:4`. Type is `DrizzleDB = ReturnType<typeof createDrizzleConnection>`.
- **Env module** (`apps/api/src/core/env/`) — `@Global()` module, Zod-validated schema (`env.schema.ts:5`) with `PORT`, `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`. Accessed via `EnvService.get()`.
- **Events module** (`apps/api/src/core/events/`) — `@Global()` module, NestJS `EventEmitterModule`, provides `DomainEventDispatcher` abstract class implemented by `NestJsEventDispatcher` (`nestjs-event-dispatcher.ts:6`). Wired but **unused** — no domain events are dispatched yet.
- **DDD domain kernel** (`apps/api/src/shared/domain/`) — 25 files, fully implemented. See `ddd-kernel-patterns.md` for details.

### Database Schema (Only Auth Tables)

Four tables exist in `core/database/drizzle/schemas/auth-schema.ts`, all managed by better-auth:

| Table | Key Columns | Purpose |
|---|---|---|
| `users` | `id` (text PK), `name`, `email` (unique), `emailVerified`, `image` | User identity |
| `sessions` | `id`, `token` (unique), `userId` FK, `expiresAt`, `ipAddress`, `userAgent` | Active sessions |
| `accounts` | `id`, `accountId`, `providerId`, `userId` FK, `accessToken`, `refreshToken` | OAuth providers |
| `verifications` | `id`, `identifier`, `value`, `expiresAt` | Email verification |

All use `text` for IDs (UUIDv4 generated). Relations defined: `users` → many `sessions`, many `accounts`.

### Empty Scaffolding (Zero Implementation)

- `apps/api/src/modules/users/` — directories `get-user-profile/`, `infra/mappers/`, `infra/persistence/` exist but contain **zero `.ts` files**
- `apps/api/src/modules/session/` — empty directory, no files
- Only one controller exists: `app.controller.ts:6` with `GET /api/health-check` (`@AllowAnonymous()`)
- Only one service exists: `app.service.ts:3` with `healthCheck()` returning `"healthy"`

### Auth Decorators (from `@thallesp/nestjs-better-auth`)

- `@Session()` — param decorator, injects `UserSession` type with `session.user.id`, `session.user.email`, etc.
- `@AllowAnonymous()` — marks route as public (bypasses auth guard)
- `@OptionalAuth()` — auth is optional, session may be null
- `UserSession` type — `{ user: { id, name, email, ... }, session: { id, token, expiresAt, ... } }`

### Requirements Gap Analysis

| Requirement | ID | Status |
|---|---|---|
| Autenticacao | RF07 | Done (better-auth) |
| Contas e Carteiras | RF01 | Not started |
| Categorias | RF03 | Not started |
| Transacoes | RF02 | Not started |
| Metas e Orcamentos | RF03 | Not started |
| Relatorios e Dashboards | RF04 | Not started |
| Recorrencias | RF05 | Not started |
| Notificacoes | RF08 | Not started |
| Sincronizacao Bancaria | RF06 | Not started |

## Decisions / Open Questions

- Decision: RF01 (Bank Accounts) should be implemented first — it has zero dependencies and all other features depend on it
- Decision: The recommended implementation order is: Accounts → Categories → Transactions → User Profile/Settings → Recurrences → Budgets/Goals → Reports → Notifications → Integrations
- Open: The `user-aggregate-erd.md` doc defines `profiles`, `settings`, and `authentication` tables that do not yet exist — better-auth handles auth differently than the ERD envisioned

## References

- `apps/api/src/core/auth/auth.config.ts:8` — better-auth configuration
- `apps/api/src/core/database/constants.ts:1` — `DRIZZLE_DB` symbol token
- `apps/api/src/core/database/connection.ts:4` — Drizzle connection factory
- `apps/api/src/core/env/env.schema.ts:5` — Zod env validation schema
- `apps/api/src/core/events/nestjs-event-dispatcher.ts:6` — event dispatcher implementation
- `apps/api/src/shared/domain/index.ts` — DDD kernel barrel export
- `apps/api/src/app.module.ts:8` — root module imports
- `apps/api/src/app.controller.ts:6` — only existing controller
- `docs/1759610610-01-requisitos.md` — requirements document
- `docs/1760055212-02-dominios-subdominios.md` — domain/subdomain mapping
