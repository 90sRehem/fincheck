# Project Structure

**Root:** `/home/rehem/Documents/dev/personal/fincheck`

## Directory Tree

```
fincheck/
├── .specs/                    # Project specs (TLC workflow)
│   ├── project/               # PROJECT.md, ROADMAP.md, STATE.md
│   ├── codebase/             # 7 brownfield docs
│   ├── features/              # Feature specs
│   └── quick/                 # Quick mode tasks
├── apps/
│   ├── api/                  # NestJS backend
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   ├── app.controller.ts
│   │   │   ├── app.service.ts
│   │   │   ├── core/         # Infrastructure
│   │   │   │   ├── auth/     # better-auth
│   │   │   │   ├── database/ # Drizzle + schemas
│   │   │   │   ├── env/      # Zod env validation
│   │   │   │   └── events/   # Event emitter
│   │   │   ├── modules/      # Domain modules
│   │   │   │   └── bank-accounts/
│   │   │   └── shared/       # Domain kernel
│   │   │       └── domain/
│   │   │           ├── entities/
│   │   │           ├── errors/
│   │   │           ├── types/
│   │   │           ├── validators/
│   │   │           └── value-objects/
│   │   ├── biome.json        # Override: useImportType off
│   │   ├── drizzle.config.ts
│   │   ├── package.json
│   │   └── vitest.config.ts
│   ├── web/                  # React SPA
│   │   ├── src/
│   │   │   ├── app/         # App-level
│   │   │   │   ├── main.tsx
│   │   │   │   ├── providers/
│   │   │   │   ├── routes/
│   │   │   │   └── styles.css
│   │   │   ├── pages/       # Page layer
│   │   │   │   ├── home/    # Dashboard
│   │   │   │   └── session/ # Login/Register
│   │   │   ├── entities/    # Entity layer
│   │   │   │   ├── session/
│   │   │   │   ├── users/
│   │   │   │   └── balance/
│   │   │   └── shared/      # Shared utilities
│   │   │       ├── api/
│   │   │       ├── lib/
│   │   │       └── ui/
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   └── tsconfig.json
│   └── docs/                 # Storybook
│       ├── src/
│       │   └── stories/
│       ├── .storybook/
│       ├── package.json
│       └── .eslintrc.cjs     # Note: uses ESLint, NOT Biome
├── packages/
│   ├── design-system/        # Component library
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── ui/     # Primitives
│   │   │   │   └── patterns/ # Composed
│   │   │   ├── tokens/     # Design tokens
│   │   │   ├── lib/        # Utilities (cn)
│   │   │   └── index.ts    # Barrel
│   │   ├── scripts/        # Token generation
│   │   ├── package.json
│   │   └── vite.config.ts
│   └── ts-config/           # Shared TS configs
│       ├── base.json
│       ├── node.json
│       └── react.json
├── turbo.json               # Turborepo config
├── biome.json               # Root lint/format config
├── package.json             # Root (workspace)
└── docker-compose.yml       # Local dev infrastructure
```

---

## Module Organization

### Backend: `apps/api`

| Area | Purpose | Location |
|---|---|---|
| **Bootstrap** | Express app, Swagger, CORS, prefix | `src/main.ts` |
| **Root Module** | Imports all feature modules | `src/app.module.ts` |
| **Auth** | better-auth + NestJS adapter | `src/core/auth/` |
| **Database** | Drizzle connection, schemas | `src/core/database/` |
| **Env** | Zod validation | `src/core/env/` |
| **Events** | Event emitter | `src/core/events/` |
| **Bank Accounts** | Full CRUD module (DDD) | `src/modules/bank-accounts/` |
| **Shared Kernel** | Entity, Either, errors | `src/shared/domain/` |

### Frontend: `apps/web`

| Area | Purpose | Location |
|---|---|---|
| **Entry** | React + Router + Query | `src/app/main.tsx` |
| **Providers** | Query client, router context | `src/app/providers/` |
| **Routes** | TanStack Router config | `src/app/routes/` |
| **Home Page** | Dashboard UI + logic | `src/pages/home/` |
| **Session Pages** | Login + Register | `src/pages/session/` |
| **Session Entity** | Auth state management | `src/entities/session/` |
| **Users Entity** | User data | `src/entities/users/` |
| **Balance Entity** | Balance queries | `src/entities/balance/` |
| **API Client** | HTTP wrapper | `src/shared/api/` |
| **Services** | Token, user, storage | `src/shared/lib/` |

### Design System: `packages/design-system`

| Area | Purpose | Location |
|---|---|---|
| **UI Primitives** | Radix-based components | `src/components/ui/` |
| **Patterns** | Composed components | `src/components/patterns/` |
| **Tokens** | Design tokens + CSS gen | `src/tokens/` |
| **Utilities** | cn() helper | `src/lib/` |

---

## Where Things Live

### Authentication

- **Backend:** `apps/api/src/core/auth/` (config, module, provider)
- **Frontend Store:** `apps/web/src/entities/session/model/session-store.ts`
- **Frontend Pages:** `apps/web/src/pages/session/`
- **API Endpoints:** Via better-auth (auto-generated)

### Bank Accounts

- **Backend Module:** `apps/api/src/modules/bank-accounts/`
  - Domain: `domain/entities/`, `domain/use-cases/`, `domain/repositories/`
  - Presentation: `*.controller.ts`
  - Infra: `infra/drizzle/schemas/`, `infra/persistence/`
- **Frontend API:** `apps/web/src/pages/home/api/accounts.ts`
- **Frontend Hooks:** `apps/web/src/pages/home/model/use-list-accounts.ts`, `use-add-account.ts`
- **Frontend UI:** `apps/web/src/pages/home/ui/acounts-list.tsx`, `add-accounts.tsx`

### Transactions (Backend Missing)

- **Frontend API:** `apps/web/src/pages/home/api/transactions.ts` (calls `/transactions`)
- **Frontend Hooks:** `apps/web/src/pages/home/model/use-transactions.ts`
- **Frontend UI:** `apps/web/src/pages/home/ui/transactions-list.tsx`, `add-expense.tsx`, `add-revenue.tsx`
- **Backend:** ❌ Module does not exist

### Categories (Backend Missing)

- **Frontend API:** `apps/web/src/pages/home/api/categories.ts`, `colors.ts`
- **Frontend Hooks:** `apps/web/src/pages/home/model/use-categories-list.ts`, `use-list-colors.ts`
- **Frontend UI:** Used in transaction forms
- **Backend:** ❌ Module does not exist

### Balance (Backend Missing)

- **Frontend API:** `apps/web/src/entities/balance/api/get-balance.ts`
- **Frontend Entity:** `apps/web/src/entities/balance/`
- **Backend:** ❌ No balance calculation API

---

## Special Directories

| Directory | Purpose | Key Files |
|---|---|---|
| `.specs/` | TLC workflow artifacts | PROJECT.md, ROADMAP.md, STATE.md, codebase docs |
| `apps/api/src/shared/domain/` | Domain kernel | Entity, ValueObject, Either, errors |
| `apps/api/src/core/database/drizzle/` | DB connection + schemas | connection.ts, schemas/, migrations/ |
| `apps/web/src/shared/api/` | HTTP abstraction | api-client.ts, endpoints/ |
| `packages/design-system/src/tokens/` | Design tokens | colors.ts, spacing.ts, typography.ts |

---

## Import Paths

| Area | Path Alias |
|---|---|
| Backend shared | `@/shared/domain/...` (defined in tsconfig) |
| Frontend src | `@/...` maps to `apps/web/src/` |
| Design system | `@fincheck/design-system` (workspace) |
| TS configs | `@fincheck/ts-config` (workspace) |