# @fincheck/api — Backend API

NestJS 11 backend with DDD scaffolding, Drizzle ORM, better-auth, and PostgreSQL.

## Stack

- **Framework:** NestJS 11 + Express
- **ORM:** Drizzle ORM + PostgreSQL 15
- **Auth:** better-auth + `@thallesp/nestjs-better-auth`
- **Validation:** Zod (env config, DTOs)
- **API Docs:** Swagger + Scalar (GET /docs)
- **Testing:** Vitest (unplugin-swc + vite-tsconfig-paths)

## Structure

```
src/
├── main.ts                    # Bootstrap: Express, CORS, Swagger, global prefix /api
├── app.module.ts              # Root module
├── app.controller.ts          # Health check: GET /api/health-check
├── core/                      # Infrastructure layer (IMPLEMENTED)
│   ├── auth/                  # better-auth config, NestJS module/provider
│   ├── database/              # Drizzle connection, schemas, migrations
│   └── env/                   # Zod-validated env via NestJS ConfigModule
├── modules/                   # Domain modules (SCAFFOLDED — EMPTY)
│   ├── users/
│   │   ├── get-user-profile/  # Use-case folder pattern (empty)
│   │   └── infra/             # persistence/, mappers/ (empty)
│   └── session/               # (empty directory)
└── shared/                    # Domain kernel (SCAFFOLDED — EMPTY)
    └── domain/
```

## Key Conventions

### Auth
- **Global guard:** All routes protected by default via `AuthModule.forRoot()`
- **Public routes:** Use `@AllowAnonymous()` decorator
- **Optional auth:** Use `@OptionalAuth()`
- **Session access:** `@Session()` param decorator

### Database
- **DI injection:** `@Inject(DRIZZLE_DB) private readonly db: DrizzleDB` (symbol token from `src/core/database/constants.ts`)
- **Table naming:** Plural (`usePlural: true` in better-auth adapter) — `users`, `sessions`, `accounts`, `verifications`
- **ID strategy:** UUIDv4 as `text` (not native UUID)
- **Schema location:** `src/core/database/drizzle/schemas/`
- **Migrations:** `src/core/database/drizzle/migrations/`

### Modules
- **Global modules:** `EnvModule` and `DatabaseModule` are `@Global()` — inject directly without importing
- **Barrel exports:** Always import from `core/*/index.ts`, not deep paths
- **Use-case pattern:** Each use-case gets its own folder (e.g., `modules/users/get-user-profile/`)
- **Infra layer:** Co-located within module at `<module>/infra/{persistence,mappers}/`

### Biome Override
- **`useImportType: off`** — NestJS DI requires runtime imports for injectable classes
- **File:** `apps/api/biome.json` overrides root config

## Caveats

- **Test files STALE:** `app.controller.spec.ts` expects `"Hello World!"` but service returns `"healthy"`. E2E tests expect `/` but app uses `/api` prefix.

For module structure, entity/VO patterns, and use-case conventions, load the `nestjs-ddd` skill.
For schema changes, migrations, and Drizzle patterns, load the `fincheck-database` skill.
