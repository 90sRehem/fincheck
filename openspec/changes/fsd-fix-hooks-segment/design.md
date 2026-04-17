## Context

The `pages/home/` slice currently has 8 files in `api/`:

| File | Type | Correct segment? |
|------|------|-----------------|
| `transactions.ts` | Fetch functions + types | Yes (`api/`) |
| `accounts.ts` | Fetch functions + types | Yes (`api/`) |
| `categories.ts` | Fetch functions + types | Yes (`api/`) |
| `colors.ts` | Fetch functions + types | Yes (`api/`) |
| `account-types.ts` | Fetch functions + types | Yes (`api/`) |
| `use-update-transactions.ts` | React hook (useMutation) | **No** -> `model/` |
| `use-transaction.ts` | React hook (useSuspenseQuery) | **No** -> `model/` |
| `use-remove-transaction.ts` | React hook (useMutation) | **No** -> `model/` |

The `model/` segment already contains 19 files including similar hooks (`use-transactions.ts`, `use-create-transaction.ts`, `use-add-account.ts`, etc.), confirming `model/` is the established location for hooks in this slice.

## Goals / Non-Goals

**Goals:**
- Relocate 3 hook files from `api/` to `model/` to satisfy FSD Rule 4-4
- Update all import paths in consuming UI components
- Fix minor naming inconsistency: `use-update-transactions.ts` (plural) -> `use-update-transaction.ts` (singular, matching the function name `useUpdateTransaction`)

**Non-Goals:**
- Refactoring hook internals or changing any business logic
- Adding barrel re-exports for these hooks in `pages/home/index.ts` (they aren't exported today and don't need to be)
- Moving other hooks that are already correctly placed in `model/`
- Auditing other slices for similar FSD violations

## Decisions

### 1. Move files rather than create new + delete old

**Decision:** Use git mv (or move + update) to preserve git history for blame/log.

**Rationale:** These hooks have meaningful commit history. Creating new files would break `git log --follow` for contributors tracking changes.

**Alternative considered:** Copy-paste into new files, delete old. Rejected because it loses authorship attribution.

### 2. Fix the plural naming inconsistency during the move

**Decision:** Rename `use-update-transactions.ts` to `use-update-transaction.ts` (singular) while moving.

**Rationale:** The exported function is `useUpdateTransaction` (singular). All other transaction hooks use singular naming (`use-transaction.ts`, `use-remove-transaction.ts`, `use-create-transaction.ts`). Fixing during the move avoids a separate rename PR.

**Alternative considered:** Keep the plural name. Rejected because it's inconsistent with the codebase convention and would require explaining in code review.

### 3. Import path adjustment strategy

**Decision:** After moving hooks to `model/`, their internal imports of `./transactions` (the api file) must change to `../api/transactions` since they'll be one directory deeper.

**File-by-file import path changes:**

| Moved file | Old import | New import |
|-----------|-----------|-----------|
| `model/use-update-transaction.ts` | `from "./transactions"` | `from "../api/transactions"` |
| `model/use-transaction.ts` | `from "./transactions"` | `from "../api/transactions"` |
| `model/use-remove-transaction.ts` | `from "./transactions"` | `from "../api/transactions"` |

**Consumer file import path changes:**

| Consumer file | Old import | New import |
|--------------|-----------|-----------|
| `ui/update-transaction.tsx:15` | `from "../api/use-transaction"` | `from "../model/use-transaction"` |
| `ui/update-transaction.tsx:16` | `from "../api/use-update-transactions"` | `from "../model/use-update-transaction"` |
| `ui/remove-transaction.tsx:5` | `from "../api/use-transaction"` | `from "../model/use-transaction"` |
| `ui/remove-transaction.tsx:6` | `from "../api/use-remove-transaction"` | `from "../model/use-remove-transaction"` |

### 4. No barrel export changes

**Decision:** Do not add these hooks to `pages/home/index.ts`.

**Rationale:** They are consumed only within the `pages/home/` slice (by sibling UI components). FSD does not require intra-slice exports in the public API barrel. The current barrel correctly exports only what other layers need.

## Risks / Trade-offs

- **[Risk] Stale import caches** -> Run `turbo check-types` after the move. TypeScript's module resolution will catch any broken imports at compile time.
- **[Risk] Other files importing these hooks** -> Grep confirmed only 2 consumer files (`ui/update-transaction.tsx`, `ui/remove-transaction.tsx`). No other slices or layers import these hooks.
- **[Risk] Merge conflicts with in-flight PRs** -> Low. These files are stable (transaction CRUD is complete). Communicate the move in the PR description.
