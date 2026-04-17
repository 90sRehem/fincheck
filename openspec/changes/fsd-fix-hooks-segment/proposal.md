## Why

Three React hooks (`useUpdateTransaction`, `useTransaction`, `useRemoveTransaction`) are placed in the `api/` segment of `pages/home/`, violating FSD Rule 4-4: the `api/` segment must contain only fetch functions and type definitions, while hooks (stateful logic) belong in `model/`. This misplacement blurs the boundary between data-fetching infrastructure and application logic, making the slice harder to reason about and setting a bad precedent for future slices.

## What Changes

- **Move 3 hook files** from `pages/home/api/` to `pages/home/model/`:
  - `api/use-update-transactions.ts` -> `model/use-update-transaction.ts` (also fixes plural naming inconsistency)
  - `api/use-transaction.ts` -> `model/use-transaction.ts`
  - `api/use-remove-transaction.ts` -> `model/use-remove-transaction.ts`
- **Update 2 import sites** in UI components that consume these hooks:
  - `ui/update-transaction.tsx` — imports `useTransaction` and `useUpdateTransaction`
  - `ui/remove-transaction.tsx` — imports `useTransaction` and `useRemoveTransaction`
- **No changes to `pages/home/index.ts`** — these 3 hooks are not currently re-exported from the barrel.
- **No logic changes** — file contents remain identical; only locations and import paths change.

## Capabilities

### New Capabilities

_None — this is a structural refactor, no new behavior._

### Modified Capabilities

_None — no spec-level behavior changes._

## Impact

- **Affected app:** `web` only
- **Affected slice:** `pages/home/`
- **Files moved:** 3 (from `api/` to `model/`)
- **Files edited:** 2 (import path updates in `ui/update-transaction.tsx` and `ui/remove-transaction.tsx`)
- **Risk:** Low — pure mechanical refactor with no logic changes
- **Dependencies:** None affected — hooks import from `./transactions` (same `api/` sibling) which stays unchanged; after the move they will import from `../api/transactions` instead.

## Success Criteria

1. No `.ts` files in `pages/home/api/` export React hooks (functions calling `useMutation`, `useQuery`, `useSuspenseQuery`, etc.)
2. All 3 hooks exist in `pages/home/model/` and are importable
3. `turbo check-types` passes with zero errors
4. `bun run lint` passes with zero errors
5. The `api/` segment contains only pure fetch functions (`transactions.ts`, `accounts.ts`, `categories.ts`, `colors.ts`, `account-types.ts`) and their types
