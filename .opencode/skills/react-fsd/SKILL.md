---
name: react-fsd
description: Frontend FSD architecture - layer hierarchy (app/pages/entities/shared), slice anatomy (api/model/ui/lib), import rules, custom store pattern, custom HTTP client, React Query patterns
---

# React FSD Patterns

Feature-Sliced Design architecture for Fincheck web app (React 19 + TanStack + custom patterns).

## Layer Hierarchy

**Simplified FSD:** `app` > `pages` > `entities` > `shared` (no features/widgets yet)

```
src/
├── app/           # Bootstrap, providers, routing, global styles
├── pages/         # Page slices (home/, session/)
├── entities/      # Domain entities (session/, users/, balance/)
└── shared/        # Shared infrastructure
```

**Import rule:** Layers import only from layers **below**. Never up or sideways.

## Slice Anatomy

Every slice has up to 4 subdirectories:

| Dir | Purpose | Example |
|---|---|---|
| `api/` | Server communication | `transactions.ts`, `get-user.ts`, query factories |
| `model/` | State + hooks + schemas | Stores, `use-*.ts`, Zod schemas |
| `ui/` | Components | `home-page.tsx`, `login-page.tsx` |
| `lib/` | Utilities | `category-mapping.ts`, `date-periods.ts` |

**Barrel export:** Each slice has `index.ts` as public API.

## State Management (3 Patterns)

### 1. Custom Store (createStore)

For synchronous UI state:

```typescript
import { createStore } from "@/shared/lib/core/store";

const store = createStore<StateType>(initialState);

const actions = {
  setFoo: (value) => store.setState({ foo: value }),
};

// In component
const foo = store.useSelector(state => state.foo);
```

**Used by:** sessionStore, userStore, balanceVisibilityStore, transactionsFiltersStore, period selectors

**Implementation:** Custom Zustand-like store using `useSyncExternalStore`, selector-based equality

### 2. React Query

For server state:

- `useSuspenseQuery` — critical data, requires `<Suspense>` + `<ErrorBoundary>` wrapper
- `useInfiniteQuery` — paginated lists
- `useMutation` — writes

**Query factories pattern:**
```typescript
export const userQueryFactory = {
  all: ["users"],
  getMe: () => queryOptions({
    queryKey: [...userQueryFactory.all, "me"],
    queryFn: () => getUser({ id: "me" }),
  }),
};

// Usage
const { data: user } = useSuspenseQuery(userQueryFactory.getMe());
```

**MutationCache meta:** `{ successMessage, errorMessage, invalidatesQuery }` for auto-invalidation

### 3. SessionStorage (StorageService)

For persistence:

```typescript
const storage = new StorageService<T>("storage-key", sessionStorage);
storage.set(value);
const value = storage.get();
```

**Used by:** `TokenStorage` (`"fincheck:token"`), `UserStorage` (`"fincheck:user"`)

## Custom HTTP Client

**Architecture:** `HttpClient` interface → `FetchHttpClient` → `createApiClient()` → `apiClient` singleton

```typescript
// src/shared/api/api-client.ts
export const apiClient = createApiClient({
  baseURL: "http://localhost:8000",
  headers: async () => ({
    Authorization: `Bearer ${tokenService.getToken()}`,
  }),
  interceptors: {
    error: async (error) => {
      if (error.statusCode === 401) {
        tokenService.notifyTokenExpired(); // Auto-logout
      }
      throw error;
    },
  },
});
```

**Usage:**
```typescript
const data = await apiClient.get<ResponseType>("/endpoint");
```

## Routing (TanStack Router)

**Tree:**
```
/ (RootLayout)
├── / (HomePage) [authGuard]
│   └── modals: /filters, /add-expense, /$id, etc.
└── /session (SessionLayout)
    ├── /login [guestGuard]
    └── /register [guestGuard]
```

**Guards:**
- `authGuard` — checks `userIsAuthenticated()`, redirects to `/session/login`
- `guestGuard` — redirects authenticated users to `/` or redirect param

**Search params:** `{accountId?, year?, month?, type?}` on index route

## Error Handling Pattern

**Wrapping:**
```tsx
<QueryErrorResetBoundary>
  <ErrorBoundary fallback={<ErrorUI />}>
    <Suspense fallback={<Skeleton />}>
      <Component />
    </Suspense>
  </ErrorBoundary>
</QueryErrorResetBoundary>
```

**ApiError class:** Helpers `isUnauthorized()`, `isNotFound()`, `getFirstErrorMessage()`

## Form Pattern

**Stack:** Zod schema → react-hook-form → design system components

```typescript
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { loginSchema } from "./model/login-schema";

const form = useForm({
  resolver: standardSchemaResolver(loginSchema),
});
```

## File Naming

- Components: `kebab-case.tsx` exports `PascalCase`
- Stores: `*-store.ts`
- Hooks: `use-*.ts`
- Schemas: `*-schema.ts`
- Props: `Readonly<PropsType>`

## Import Conventions

- Path alias: `@/*` → `src/*`
- Design system: `import { Button } from "@fincheck/design-system"`
- Cross-layer: `import { X } from "@/entities/session"` (through barrel)
- Within slice: relative `./header`, `../model/use-login`

## Language

- UI text: Brazilian Portuguese (pt-BR)
- Code: English (variables, comments, types)
- Formatting: `"pt-BR"` locale (dates, currency)

## Caveats

- Only 1 test file exists (create-store.test.ts)
- Module Federation commented out in vite.config.ts
