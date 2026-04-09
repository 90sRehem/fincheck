# Architecture

**Pattern:** Modular Monolith (NestJS backend) + SPA (React frontend)

## High-Level Structure

```
┌─────────────────────────────────────────────────────────────┐
│                      Turborepo                              │
├─────────────────────────┬─────────────────┬───────────────┤
│     apps/api            │    apps/web     │ packages/     │
│     NestJS + Drizzle    │   React 19      │ design-system │
│     (Port 3333)         │   (Port 3000)   │ + ts-config   │
└───────────┬─────────────┴────────┬────────┴───────────────┘
            │                       │
            ▼                       ▼
        PostgreSQL            Design System
           15                    Package
```

### Communication

- **Frontend → Backend:** REST API over HTTP (`/api/*`)
- **Design System:** Workspace package imported by web and docs apps
- **No direct communication** between apps (apps must not import each other)

---

## Backend Architecture

### Pattern: DDD-lite with NestJS

```
apps/api/src/
├── main.ts                    # Bootstrap: Express, CORS, Swagger, /api prefix
├── app.module.ts              # Root module - imports all feature modules
├── core/                      # Infrastructure layer
│   ├── auth/                  # better-auth config + NestJS adapter
│   ├── database/             # Drizzle connection + schemas
│   │   └── drizzle/
│   │       └── schemas/      # Auth schemas (users, sessions, accounts)
│   ├── env/                   # Zod-validated env via NestJS ConfigModule
│   └── events/                # Event emitter infrastructure
├── modules/                   # Domain modules
│   └── bank-accounts/        # Example: fully implemented
│       ├── domain/           # Pure business logic (entities, use-cases)
│       │   ├── entities/     # BankAccount entity
│       │   ├── repositories/ # Abstract repository interface
│       │   ├── use-cases/    # Pure use-cases (no @Injectable)
│       │   └── validators/   # Domain validators
│       ├── application/      # Not used - direct to domain
│       ├── presentation/      # Controllers (HTTP layer)
│       │   └── [feature]/
│       │       └── *.controller.ts
│       └── infra/            # Infrastructure adapters
│           ├── drizzle/      # Drizzle schema
│           ├── persistence/  # Repository implementation
│           └── mappers/      # Domain ↔ Persistence mapper
└── shared/                   # Domain kernel
    ├── domain/               # Entity, ValueObject, Either, UseCase base
    ├── errors/              # NotFound, ValidationError, etc.
    └── validators/           # Validation strategy pattern
```

### Key Patterns Observed

#### 1. UseCase Pattern

**Location:** `modules/bank-accounts/domain/use-cases/`

Pure domain logic without NestJS decorators:

```typescript
// domain/use-cases/create-bank-account.use-case.ts
export class CreateBankAccountUseCase {
  constructor(private readonly repository: BankAccountRepository) {}
  
  async execute(input: CreateBankAccountInput): Promise<Either<ValidationError, BankAccount>> {
    // Business logic only - no @Injectable
  }
}
```

**Wrapper:** In `presentation/`, a controller calls the use-case directly (since the AGENTS.md mentions services, but code shows direct injection pattern).

#### 2. Repository Pattern (Ports & Adapters)

**Port (abstract):** `modules/bank-accounts/domain/repositories/bank-account.repository.ts`

```typescript
export abstract class BankAccountRepository {
  abstract create(bankAccount: BankAccount): Promise<BankAccount>;
  abstract findById(id: string, userId: string): Promise<BankAccount | null>;
  // ...
}
```

**Adapter (concrete):** `modules/bank-accounts/infra/persistence/drizzle-bank-account.repository.ts`

Bound in module:

```typescript
// bank-accounts.module.ts
{
  provide: BankAccountRepository,
  useClass: DrizzleBankAccountRepository,
}
```

#### 3. Domain Kernel

**Location:** `shared/domain/`

- `entities/entity.ts` — Base Entity class with ID
- `value-objects/value-object.ts` — Base ValueObject
- `types/either.ts` — Left/Right for error handling
- `types/use-case.ts` — Base UseCase interface
- `errors/not-found.ts`, `validation-error.ts` — Domain errors

---

## Frontend Architecture

### Pattern: Simplified Feature-Sliced Design (FSD)

```
apps/web/src/
├── app/                      # App-level
│   ├── main.tsx              # Entry point
│   ├── providers/           # React Query, Router providers
│   ├── routes/              # TanStack Router config
│   │   ├── root-route.tsx   # Root layout + routes
│   │   ├── guards.ts        # authGuard, guestGuard
│   │   └── session-routes.tsx
│   └── styles.css           # Tailwind imports
├── pages/                    # Page layer
│   ├── home/                # Dashboard
│   │   ├── api/             # API calls (transactions, accounts, etc.)
│   │   ├── model/           # Hooks, stores, schemas
│   │   ├── ui/              # Page components
│   │   └── lib/             # Helpers
│   └── session/             # Login/Register
│       ├── ui/
│       └── model/
├── entities/                 # Entity layer (session, users, balance)
│   ├── session/             # Auth store (token-based)
│   ├── users/               # User data + avatar
│   └── balance/             # Balance queries
└── shared/                   # Shared utilities
    ├── api/                 # ApiClient, endpoints
    ├── lib/                 # Token, user, storage services
    └── ui/                  # Global components
```

### Key Patterns

#### 1. TanStack Router (file-based)

**Configuration:** `app/routes/root-route.tsx`

Routes defined programmatically (not file-based), with:
- `createRootRouteWithContext` — root with query client context
- `beforeLoad: authGuard` — protection on index route
- Search params validation

#### 2. TanStack Query

**Setup:** `shared/lib/react-query/query-client.ts`

Query client with default options (stale time, retries).

#### 3. Custom Stores

Used for client-only state (no server sync):
- `balance-visibility-store.ts` — toggle balance visibility
- `period-selector-store.ts` — month/year selector
- `transactions-filters-store.ts` — active filters

#### 4. ApiClient

**Location:** `shared/api/api-client.ts`

Custom fetch wrapper with:
- Base URL from env
- Auth token injection
- Error handling

---

## Design System Architecture

### Two-Tier Component Model

```
packages/design-system/src/
├── components/
│   ├── ui/                  # Primitives (Radix-based)
│   │   ├── button.tsx       # CVA variants
│   │   ├── dialog.tsx       # Radix Dialog
│   │   ├── select.tsx       # Radix Select
│   │   └── icons/           # Icon sub-exports
│   └── patterns/            # Composed (domain-aware)
│       ├── input-field.tsx  # Form field composition
│       ├── balance.tsx      # Balance display
│       └── card/            # Card variants
├── tokens/                  # Design tokens (TS)
│   └── theme.css            # Generated output
└── lib/                    # cn() utility
```

### Token Pipeline

1. Tokens defined as TypeScript objects in `src/tokens/`
2. `scripts/build-tokens.ts` generates `theme.css`
3. Vite builds library (ESM + CJS)

---

## Data Flow

### Authentication Flow

```
Frontend (login)
    ↓ POST /api/auth/sign-in/email
better-auth (backend)
    ↓ create session
    ↓ set cookie (httpOnly)
    ↓ return session (client-visible token)
Frontend session entity
    ↓ store token in localStorage
    ↓ token on every API call (Authorization header)
```

### Bank Account CRUD Flow

```
Frontend (create account)
    ↓ POST /api/bank-accounts
BankAccountsController
    ↓ calls CreateBankAccountUseCase.execute()
    ↓ CreateBankAccountUseCase
    ↓ validates input, creates entity
    ↓ calls BankAccountRepository.create()
DrizzleBankAccountRepository
    ↓ inserts to DB via Drizzle
    ↓ returns persisted entity
    ↓ maps to domain entity
    ↓ returns Either<Error, BankAccount>
    ↓ Controller returns HTTP response
Frontend receives and updates Query cache
```

---

## Module Boundaries

### Backend Modules

| Module | Status | Notes |
|---|---|---|
| `core/auth` | ✅ Done | better-auth with NestJS adapter |
| `core/database` | ✅ Done | Drizzle connection + schemas |
| `core/env` | ✅ Done | Zod schema validation |
| `core/events` | ✅ Done | Event emitter infrastructure |
| `modules/bank-accounts` | ✅ ~80% | Full CRUD, needs balance calc |
| `modules/session` | ⚠️ Empty | Directory exists, no files |
| `modules/users` | ⚠️ Empty | Directory exists, no files |
| `modules/transactions` | ❌ Missing | Needed for M3 |

### Frontend Layers

| Layer | Purpose | Status |
|---|---|---|
| `app/` | Providers, router, guards | ✅ Done |
| `pages/home` | Dashboard UI + logic | ✅ Done (API needed) |
| `pages/session` | Login/Register | ✅ Done |
| `entities/session` | Auth state | ✅ Done |
| `entities/users` | User data | ✅ Done |
| `entities/balance` | Balance queries | ✅ Done (API needed) |

---

## Infrastructure

- **API Prefix:** `/api` (set in `main.ts`)
- **Swagger:** Available at `/docs` (Scalar)
- **CORS:** Enabled (origins not restricted in code)
- **Global Modules:** `EnvModule`, `DatabaseModule` are `@Global()`
- **Auth Guard:** Global — all routes protected by default via better-auth