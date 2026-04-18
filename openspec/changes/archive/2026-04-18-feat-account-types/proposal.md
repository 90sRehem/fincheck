# Proposal: feat-account-types

## Problem

The frontend SPA (`apps/web`) makes a `GET /api/account_types` request to populate the bank account type selector (checking, savings, credit card, cash, investment). This endpoint does not exist in the backend, causing a runtime error that blocks the bank account creation/editing flow.

## Solution

Add a lightweight `GET /api/account_types` endpoint that returns the existing `BANK_ACCOUNT_TYPE` values as a static list. This is **reference data** — no database table, no entity, no repository needed. The endpoint simply serializes the `BANK_ACCOUNT_TYPE` constant that already exists at `apps/api/src/modules/bank-accounts/domain/value-objects/bank-account-type.ts`.

### Key Decisions

1. **No new module** — This is a read-only reference endpoint that belongs in the existing `bank-accounts` module. It uses the same `BANK_ACCOUNT_TYPE` value object already defined there.

2. **No domain/application layers needed** — Since this returns a static constant (not persisted data), there's no use-case, service, or repository. The controller directly maps the `BANK_ACCOUNT_TYPE` constant to the response format.

3. **Authenticated endpoint** — Follows the project convention where all routes are protected by default (global auth guard). Account types are only needed by authenticated users creating/editing bank accounts.

4. **Route path: `account_types`** — Uses underscore to match the frontend's expected URL (`/api/account_types`). The controller is a separate class within the bank-accounts presentation layer to follow the "one controller per use-case" pattern observed in the codebase.

5. **Static types only** — `BANK_ACCOUNT_TYPE` remains `as const`. No database table, no migration, no pgEnum. Types are compile-time constants.

### Response Shape

```json
[
  { "id": "checking",    "name": "Checking"    },
  { "id": "savings",     "name": "Savings"     },
  { "id": "credit_card", "name": "Credit Card" },
  { "id": "cash",        "name": "Cash"        },
  { "id": "investment",  "name": "Investment"  }
]
```

The `id` is the `BANK_ACCOUNT_TYPE` value (lowercase string used in create/update requests). The `name` is a humanized label for display. This matches the frontend's `AccountType = { id: string; name: string }` type defined in `apps/web/src/pages/home/api/account-types.ts`.

### Label Map

The controller uses a static label map to convert type values to human-readable names:

```typescript
const ACCOUNT_TYPE_LABELS: Record<BankAccountType, string> = {
  checking: "Checking",
  savings: "Savings",
  credit_card: "Credit Card",
  cash: "Cash",
  investment: "Investment",
};
```

## Frontend Status

**No frontend changes required.** The full integration chain already exists and is wired up:

| File | Status | What it does |
|---|---|---|
| `pages/home/api/account-types.ts` | ✅ Ready | Defines `AccountType = { id, name }`, calls `GET /api/account_types`, wraps in `queryOptions` |
| `pages/home/model/use-list-account-types.ts` | ✅ Ready | Hook using `useSuspenseQuery`, returns `{ accountTypes }` |
| `pages/home/ui/add-accounts.tsx` | ✅ Ready | Uses `useListAccountTypes()`, maps `accountType.id` as Select value, `accountType.name` as display label |

## Dependencies

| Dependency | Status | Impact |
|---|---|---|
| `BANK_ACCOUNT_TYPE` constant | Exists | Source of truth at `bank-accounts/domain/value-objects/bank-account-type.ts` |
| `BankAccountsModule` | Exists | New controller registered here |
| Auth guard | Exists | Global — no extra work needed |
| Frontend integration | Exists | `account-types.ts` + `use-list-account-types.ts` + `add-accounts.tsx` already wired |

## Risk Assessment

| Risk | Level | Mitigation |
|---|---|---|
| Breaking existing module | Very Low | Only adding a new controller + registering it |
| Frontend contract mismatch | None | Response shape `{ id, name }` verified against frontend code |
| Performance | None | Static data, no DB call |

## Success Criteria

- [ ] `GET /api/account_types` returns 200 with array of `{ id, name }` objects
- [ ] Response contains all 5 types: checking, savings, credit_card, cash, investment
- [ ] `name` fields are humanized labels (e.g., "Credit Card" not "credit_card")
- [ ] Endpoint requires authentication (returns 401 without session)
- [ ] Swagger docs show endpoint under "Bank Accounts" tag
- [ ] `turbo check-types` passes with zero errors
- [ ] `bun run lint` passes
- [ ] Frontend account type selector populates correctly from the API

## Scope Exclusions

- No new Drizzle schema or migration (static data)
- No frontend changes (frontend already expects this endpoint with `{ id, name }` shape)
- No i18n for type labels (English labels in backend; frontend can localize later if needed)
