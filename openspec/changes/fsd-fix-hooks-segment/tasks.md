## 1. Move hook files from api/ to model/ [web/pages]

- [ ] 1.1 Move `use-update-transactions.ts` to model with singular name (`apps/web/src/pages/home/api/use-update-transactions.ts` -> `apps/web/src/pages/home/model/use-update-transaction.ts`)
  - Files: `apps/web/src/pages/home/api/use-update-transactions.ts`, `apps/web/src/pages/home/model/use-update-transaction.ts`
  - Update internal import: `from "./transactions"` -> `from "../api/transactions"`
  - Acceptance: File exists at `model/use-update-transaction.ts`, old file deleted from `api/`, internal import resolves correctly

- [ ] 1.2 Move `use-transaction.ts` to model (`apps/web/src/pages/home/api/use-transaction.ts` -> `apps/web/src/pages/home/model/use-transaction.ts`)
  - Files: `apps/web/src/pages/home/api/use-transaction.ts`, `apps/web/src/pages/home/model/use-transaction.ts`
  - Update internal import: `from "./transactions"` -> `from "../api/transactions"`
  - Acceptance: File exists at `model/use-transaction.ts`, old file deleted from `api/`, internal import resolves correctly

- [ ] 1.3 Move `use-remove-transaction.ts` to model (`apps/web/src/pages/home/api/use-remove-transaction.ts` -> `apps/web/src/pages/home/model/use-remove-transaction.ts`)
  - Files: `apps/web/src/pages/home/api/use-remove-transaction.ts`, `apps/web/src/pages/home/model/use-remove-transaction.ts`
  - Update internal import: `from "./transactions"` -> `from "../api/transactions"`
  - Acceptance: File exists at `model/use-remove-transaction.ts`, old file deleted from `api/`, internal import resolves correctly

## 2. Update consumer imports [web/pages]

- [ ] 2.1 Update imports in `update-transaction.tsx` (`apps/web/src/pages/home/ui/update-transaction.tsx`)
  - Files: `apps/web/src/pages/home/ui/update-transaction.tsx`
  - Change line 15: `from "../api/use-transaction"` -> `from "../model/use-transaction"`
  - Change line 16: `from "../api/use-update-transactions"` -> `from "../model/use-update-transaction"` (also fixes plural -> singular in path)
  - Acceptance: Both imports resolve to the new `model/` locations, no TypeScript errors in this file

- [ ] 2.2 Update imports in `remove-transaction.tsx` (`apps/web/src/pages/home/ui/remove-transaction.tsx`)
  - Files: `apps/web/src/pages/home/ui/remove-transaction.tsx`
  - Change line 5: `from "../api/use-transaction"` -> `from "../model/use-transaction"`
  - Change line 6: `from "../api/use-remove-transaction"` -> `from "../model/use-remove-transaction"`
  - Acceptance: Both imports resolve to the new `model/` locations, no TypeScript errors in this file

## 3. Verification [web/pages]

- [ ] 3.1 Run `turbo check-types` to verify TypeScript compilation
  - Acceptance: Zero type errors across the entire monorepo

- [ ] 3.2 Run `bun run lint` to verify Biome linting
  - Acceptance: Zero new lint errors (pre-existing errors like the magic number in `use-transaction.ts` are acceptable)

- [ ] 3.3 Verify `api/` segment is clean — no hook files remain
  - Files: `apps/web/src/pages/home/api/`
  - Acceptance: Only 5 files remain in `api/`: `transactions.ts`, `accounts.ts`, `categories.ts`, `colors.ts`, `account-types.ts`. None of them export React hooks.
