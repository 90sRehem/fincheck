---
name: nestjs-ddd
description: NestJS backend DDD patterns - module structure, use-case folders, core infrastructure (auth, database, env), entity/VO templates, Drizzle DI, better-auth integration
---

# NestJS DDD Patterns

Backend domain-driven design patterns for Fincheck API (NestJS 11 + Express + Drizzle + better-auth).

## Module Structure

```
src/
├── core/                     # Infrastructure (IMPLEMENTED)
│   ├── auth/                 # better-auth + NestJS
│   ├── database/             # Drizzle + PostgreSQL
│   └── env/                  # Zod validation
├── modules/                  # Domain modules (SCAFFOLDED)
│   └── <context>/
│       ├── <use-case>/       # One folder per use-case
│       ├── infra/
│       │   ├── persistence/  # Repositories
│       │   └── mappers/      # Domain <-> DB
│       └── <context>.module.ts
└── shared/domain/            # Shared kernel (SCAFFOLDED)
```

## Core Infrastructure

### Auth (better-auth)

- Global guard: all routes protected by default
- Decorators: `@AllowAnonymous()`, `@OptionalAuth()`, `@Session()`, `@Roles()`
- Config: Drizzle adapter (`usePlural: true`), email+password, UUIDv4 IDs
- Tables: users, sessions, accounts, verifications

**Static auth workaround:** `src/core/auth/auth.ts` uses `dotenv` directly (required by `AuthModule.forRoot()` at import time). Separate DI-based provider in `auth.provider.ts`.

### Database (Drizzle)

**DI pattern:**
```typescript
import { Inject } from "@nestjs/common";
import { DRIZZLE_DB } from "@/core/database/constants";
constructor(@Inject(DRIZZLE_DB) private readonly db: DrizzleDB) {}
```

**Conventions:**
- Plural table names (users, sessions)
- IDs: `text` (UUIDv4 strings, not native UUID)
- Schemas: `src/core/database/drizzle/schemas/`
- Migrations: `src/core/database/drizzle/migrations/`

**Workflow:** Modify schema → `bunx drizzle-kit generate` → review → `bunx drizzle-kit migrate`

### Env (Zod)

`EnvService.get("PORT")` — type-safe env access. `@Global()` module.

## Use-Case Pattern

```
modules/users/get-user-profile/
├── get-user-profile.controller.ts
├── get-user-profile.service.ts
├── get-user-profile.dto.ts
└── get-user-profile.spec.ts
```

## NestJS Conventions

- **Global modules:** `EnvModule`, `DatabaseModule` — inject without importing
- **Barrel imports:** `import { X } from "@/core/env"` not `"@/core/env/env.service"`
- **Biome:** `useImportType: "off"` in `apps/api/biome.json` (decorators need runtime imports)
- **TS decorators:** `experimentalDecorators: true`, `emitDecoratorMetadata: true`

## Entity/VO Templates

**Entity:**
```typescript
export abstract class Entity<T> {
  protected readonly _id: string;
  protected props: T;
  protected constructor(props: T, id?: string) {
    this._id = id ?? crypto.randomUUID();
    this.props = props;
  }
  get id(): string { return this._id; }
}
```

**Value Object:**
```typescript
export abstract class ValueObject<T> {
  protected readonly props: T;
  protected constructor(props: T) {
    this.props = Object.freeze(props);
  }
}
```

## Caveats

- Express NOT Fastify (despite packages)
- `modules/` and `shared/domain/` are scaffolded but empty
- `verbatimModuleSyntax: false` in node.json (required for NestJS)
