# @fincheck/web — Frontend SPA

React 19 SPA with Feature-Sliced Design architecture, TanStack Router/Query, and Tailwind CSS 4.

## Stack

- **Framework:** React 19 + Vite 7
- **Routing:** TanStack Router (file-based)
- **State:** TanStack Query + custom stores (not Redux/Zustand)
- **Styling:** Tailwind CSS 4 + design tokens from `@fincheck/design-system`
- **Forms:** react-hook-form + Zod + `@hookform/resolvers`
- **HTTP:** Custom `FetchHttpClient` abstraction (not raw fetch/axios)
- **Testing:** Vitest + Testing Library + jsdom

## Structure (Feature-Sliced Design)

```
src/
├── app/          # Providers, router config, guards (auth/guest), global styles
├── pages/        # Home (dashboard), Session (login/register)
├── entities/     # Session, Users, Balance — each with api/model/ui slices
└── shared/       # HTTP client, stores, storage, token/user services, error handling, config
```

**Simplified FSD variant** — no `features/` or `widgets/` layers yet. Layer hierarchy: `app` > `pages` > `entities` > `shared`.

## Commands

| Command | Purpose |
|---|---|
| `bun run dev` | Vite dev server (port 3000) |
| `bun run build` | Production build + type check |
| `bun run test` | Vitest tests |
| `bun run lint` | Biome lint |
| `bun run format` | Biome format |

## Key Conventions

### Imports
- **Path alias:** `@/*` maps to `src/*` (configured in both tsconfig.json and vite.config.ts)
- **Design system:** `import { Button, InputField } from "@fincheck/design-system"`
- **Cross-layer:** Always through barrel exports (`@/entities/session`, `@/shared/api`, `@/pages/home`)
- **Within slice:** Relative imports (`../model/use-login`, `./header`)
- **FSD rule:** Layers import only from layers below (app > pages > entities > shared)

### File Naming
- **Components:** kebab-case files, PascalCase exports (`home-page.tsx` exports `HomePage`)
- **Stores:** `*-store.ts` (e.g., `session-store.ts`, `balance-visibility-store.ts`)
- **Hooks:** `use-*.ts` (e.g., `use-login.ts`, `use-balance.ts`)
- **Schemas:** `*-schema.ts` (e.g., `create-transaction-schema.ts`)
- **Props:** Wrapped in `Readonly<>` (`props: Readonly<PropsWithChildren>`)

## API Consumption

### Environment Variables

The frontend consumes two API base URLs:

- **`VITE_AUTH_API_URL`**: The API host without version (e.g., `http://localhost:3333`)
- **`VITE_API_URL`**: The versioned API base (e.g., `http://localhost:3333/api/v1`)

**Configuration:**
```env
VITE_AUTH_API_URL=http://localhost:3333
VITE_API_URL=http://localhost:3333/api/v1
```

These are validated via `envSchema` in `apps/web/src/shared/config/env.ts`.

### API Clients

**1. `apiClient` — Versioned API calls (domain endpoints)**

Used for all domain API calls (bank-accounts, transactions, balances, colors, account_types).

```typescript
import { apiClient } from "@/shared/api";

// baseURL is http://localhost:3333/api/v1 (from VITE_API_URL)
// Paths should be relative: "/transactions", "/bank-accounts", etc.
const response = await apiClient.get<Transaction[]>({
  url: "/transactions",  // Full URL: http://localhost:3333/api/v1/transactions
  params,
});
```

**2. `authClient` — Non-versioned auth routes**

Used for authentication endpoints only (sign-in, sign-up, get-session). These routes do NOT have version prefixes.

```typescript
import { authClient } from "@/shared/api";

// baseURL is http://localhost:3333 (from VITE_AUTH_API_URL)
// Paths must include full auth prefix: "/api/auth/..."
const response = await authClient.post<LoginResponse>({
  url: "/api/auth/sign-in/email",  // Full URL: http://localhost:3333/api/auth/sign-in/email
  body: { email, password },
});
```

### Path Normalization Rules

- **Domain API paths:** Remove `/api/` prefix and use relative paths
  - Before: `"api/transactions"` or `"/api/transactions"`
  - After: `"/transactions"` (baseURL adds `/api/v1`)

- **Auth API paths:** Use full absolute paths with `/api/auth/` prefix
  - Format: `"/api/auth/sign-in/email"`, `"/api/auth/sign-up/email"`, `"/api/auth/get-session"`
  - baseURL is host-only, so full path is required

### Migration to v2

When the backend introduces a v2 API:

1. Update `.env`: `VITE_API_URL=http://localhost:3333/api/v2`
2. The change propagates to all domain API calls automatically
3. Auth routes remain unchanged (version-neutral by design)

## Caveats

- **Minimal tests:** Only 1 test file exists (create-store.test.ts)
- **Module Federation commented out:** `@module-federation/vite` is a dependency but unused in vite.config.ts

For detailed conventions (state management, routing, HTTP client, forms, error handling), load the `react-fsd` skill.
For FSD layer hierarchy, slice anatomy, import rules, and architecture patterns, load the `feature-sliced-design` skill.
