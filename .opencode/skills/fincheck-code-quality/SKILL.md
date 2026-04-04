---
name: fincheck-code-quality
description: Code quality standards - Biome rules explained (why each rule exists), TypeScript strict patterns, naming conventions, error handling, biome-ignore patterns
---

# Fincheck Code Quality Standards

Code quality rules, TypeScript patterns, and naming conventions for the Fincheck monorepo.

## Biome Rules (Why They Exist)

### `useImportType: "error"`

**What:** Type-only imports must use `import type { Foo }`

**Why:** TypeScript `verbatimModuleSyntax` ensures types are never bundled as runtime code. Prevents bloat + circular dependency issues.

**Example:**
```typescript
import type { User } from "./types";  // ✅ Type-only
import { User } from "./types";       // ❌ Bundled as value
```

**Exception:** `apps/api/biome.json` sets `"off"` because NestJS decorators require runtime imports for DI metadata.

### `noEnum: "error"`

**What:** TypeScript enums are banned

**Why:** Enums generate runtime code + have confusing reverse mappings + can't be tree-shaken. Use `as const` objects or union types instead.

**Alternative:**
```typescript
// ❌ Banned
enum Status { Active, Inactive }

// ✅ Use union type
type Status = "active" | "inactive";

// ✅ Or as const object
const Status = { ACTIVE: "active", INACTIVE: "inactive" } as const;
type Status = typeof Status[keyof typeof Status];
```

### `noDefaultExport: "error"`

**What:** Default exports are banned

**Why:** Named exports enforce consistent naming across imports, enable better IDE refactoring, prevent `import Foo from "bar"` vs `import Bar from "bar"` confusion.

**Exception:** `drizzle.config.ts` requires default export (Drizzle Kit API) — use `// biome-ignore lint/style/noDefaultExport: Drizzle Kit requires default export`

### `noMagicNumbers: "error"`

**What:** Literal numbers in logic must be extracted to named constants

**Why:** Improves readability, prevents typos, makes maintenance easier.

**Example:**
```typescript
// ❌ Magic number
if (users.length > 10) { ... }

// ✅ Named constant
const MAX_USERS = 10;
if (users.length > MAX_USERS) { ... }
```

**Exception:** `main.ts` uses file-level `// biome-ignore-all lint/style/noMagicNumbers` for port constant and session cache duration.

### `noNestedTernary: "error"`

**What:** No ternary inside ternary

**Why:** Unreadable. Use `if/else` or early returns.

**Example:**
```typescript
// ❌ Nested ternary
const label = isPrimary ? "Primary" : isSecondary ? "Secondary" : "Default";

// ✅ If/else or early returns
let label = "Default";
if (isPrimary) label = "Primary";
else if (isSecondary) label = "Secondary";
```

## TypeScript Strict Patterns

### `noUncheckedIndexedAccess: true`

**Impact:** Array/object index access returns `T | undefined`

**Why:** Prevents runtime errors from out-of-bounds access

**Example:**
```typescript
const users: User[] = [...];
const first = users[0]; // Type: User | undefined

if (first) {
  console.log(first.name); // ✅ Safe
}
```

### `verbatimModuleSyntax: true`

**Impact:** Forces explicit `import type` for types

**Why:** Ensures types are never included in runtime bundles

**Exception:** `node.json` sets `false` for NestJS decorators

### `isolatedModules: true`

**Impact:** Each file must be transpilable independently

**Why:** Required by Bun, esbuild, SWC (single-file transpilers)

**Prevents:** const enums, ambient declarations without `declare`

## Naming Conventions

### Files

| Type | Pattern | Example |
|---|---|---|
| Components | `kebab-case.tsx` | `home-page.tsx`, `user-avatar.tsx` |
| Stores | `*-store.ts` | `session-store.ts`, `balance-visibility-store.ts` |
| Hooks | `use-*.ts` | `use-login.ts`, `use-balance.ts` |
| Schemas | `*-schema.ts` | `create-transaction-schema.ts` |
| Utils | `kebab-case.ts` | `category-mapping.ts`, `date-periods.ts` |

### Exports

- **Components:** PascalCase (`export function HomePage()`)
- **Hooks:** camelCase (`export function useLogin()`)
- **Constants:** SCREAMING_SNAKE_CASE (`export const API_BASE_URL`)
- **Types:** PascalCase (`export type User`)
- **Interfaces:** PascalCase (`export interface UserRepository`)

### Props

Always wrap in `Readonly<>`:
```typescript
function Component({ userId }: Readonly<{ userId: string }>) { ... }
```

## Error Handling

### ApiError Class

**File:** `apps/web/src/shared/api/api-error.ts`

**Hierarchy:**
```
Error
└── ApiError
    └── NetworkError (statusCode: 0)
```

**Usage:**
```typescript
try {
  await apiClient.get("/users");
} catch (error) {
  if (error instanceof ApiError) {
    if (error.isUnauthorized()) { ... }
    if (error.isNotFound()) { ... }
    const msg = error.getFirstErrorMessage();
  }
}
```

### Error Boundary Pattern (Frontend)

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

## biome-ignore Patterns

### When to Use

**1. Unavoidable API requirements:**
```typescript
// biome-ignore lint/style/noDefaultExport: Drizzle Kit requires default export
export default defineConfig({ ... });
```

**2. File-level suppressions for large numbers:**
```typescript
// biome-ignore-all lint/style/noMagicNumbers: Port constants
const PORT = 3333;
const CACHE_DURATION = 300000;
```

**3. NestJS DI imports (API only):**
```typescript
// biome-ignore lint/style/useImportType: NestJS DI requires runtime import
import { EnvService } from "./env.service";
```

### When NOT to Use

**Don't suppress for laziness:** If the rule catches a real issue, fix the code, don't suppress.

## Language

- **Code:** English (variable names, comments, types, function names)
- **UI text:** Brazilian Portuguese (pt-BR)
- **Documentation:** English (README, AGENTS.md, comments)
- **Git commits:** English

## PR Standards

1. Run `bun run lint` before committing
2. Run `turbo check-types` to catch TS errors
3. Fix all Biome errors — no suppressions without justification
4. Keep PRs focused — one feature/fix per PR
5. Update relevant AGENTS.md if adding new patterns

## Test Conventions

- File naming: `*.spec.ts` (backend), `*.test.ts` (frontend)
- Co-located with source: `create-store.ts` + `create-store.test.ts`
- Framework: Vitest (primary), Jest (legacy in API)
- Patterns: `describe` > `it` > `expect`
