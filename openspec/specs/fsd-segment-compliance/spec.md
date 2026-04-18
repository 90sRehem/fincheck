# fsd-segment-compliance Specification

## Purpose
TBD - created by archiving change fsd-fix-hooks-segment. Update Purpose after archive.
## Requirements
### Requirement: api/ segment contains only fetch functions and types

The `pages/home/api/` segment SHALL contain only pure data-fetching functions (fetch wrappers, query factories) and their associated TypeScript type definitions. React hooks (functions that call `useMutation`, `useQuery`, `useSuspenseQuery`, or any React hook) SHALL NOT reside in the `api/` segment.

#### Scenario: No React hooks in api/ after refactor
- **WHEN** a developer inspects all `.ts` files in `pages/home/api/`
- **THEN** none of them export functions that call React hooks (`use*` from React or TanStack Query)

#### Scenario: Hooks are available from model/
- **WHEN** a UI component needs `useTransaction`, `useUpdateTransaction`, or `useRemoveTransaction`
- **THEN** it SHALL import them from `../model/use-*.ts` (not from `../api/use-*.ts`)

### Requirement: model/ segment naming follows singular convention

All transaction-related hook files in `pages/home/model/` SHALL use singular naming: `use-transaction.ts`, `use-update-transaction.ts`, `use-remove-transaction.ts`.

#### Scenario: File naming consistency
- **WHEN** a developer lists files in `pages/home/model/`
- **THEN** there is no file named `use-update-transactions.ts` (plural) — the correct name is `use-update-transaction.ts` (singular)

