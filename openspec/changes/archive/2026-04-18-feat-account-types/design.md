# Design: feat-account-types

## Architecture

This is a **minimal-footprint endpoint** — no new module, no domain/application layers, no database. It adds a single controller to the existing `bank-accounts` module.

### Layer Map

```
apps/api/src/modules/bank-accounts/
├── domain/
│   └── value-objects/
│       └── bank-account-type.ts          # EXISTS — source of truth
├── presentation/
│   ├── list-bank-accounts.controller.ts  # EXISTS
│   ├── create-bank-account.controller.ts # EXISTS
│   ├── update-bank-account.controller.ts # EXISTS
│   ├── delete-bank-account.controller.ts # EXISTS
│   └── list-account-types.controller.ts  # NEW — the only new file
└── bank-accounts.module.ts               # EDIT — register new controller
```

### Why Not a Separate Module?

The `BANK_ACCOUNT_TYPE` value object lives in the `bank-accounts` domain. Account types are a property of bank accounts, not a standalone bounded context. Creating a separate module would create artificial coupling (`account-types` module importing from `bank-accounts` domain) and violate module boundary conventions.

## Controller Design

### `ListAccountTypesController`

```
Route:    GET /api/account_types
Auth:     Required (global guard, no @AllowAnonymous)
Tag:      "Bank Accounts"
Response: 200 — Array of { id: string, name: string }
```

The controller:
1. Reads `BANK_ACCOUNT_TYPE` constant (already imported in module domain)
2. Uses a static label map to convert values to humanized names
3. Maps `Object.values()` to `{ id, name }` array
4. Returns directly — no service/use-case layer

### Response Schema

```typescript
// Response type (mirrors frontend AccountType)
type AccountTypeResponse = {
  id: string;   // e.g. "checking", "credit_card"
  name: string; // e.g. "Checking", "Credit Card"
};

// Full response: AccountTypeResponse[]
```

### Label Map

The controller defines a static label map to humanize type values:

```typescript
import type { BankAccountType } from "../domain";

const ACCOUNT_TYPE_LABELS: Record<BankAccountType, string> = {
  checking: "Checking",
  savings: "Savings",
  credit_card: "Credit Card",
  cash: "Cash",
  investment: "Investment",
};
```

This keeps label logic co-located with the controller (the only consumer) and typed against `BankAccountType` so adding a new type to the const forces a label to be added.

### Swagger Schema

Add `AccountTypeResponseSchema` to `apps/api/src/shared/swagger/schemas.ts`:

```typescript
export const AccountTypeResponseSchema: SchemaObject = {
  type: "object",
  properties: {
    id: { type: "string", example: "checking" },
    name: { type: "string", example: "Checking" },
  },
};
```

## Routing Decision

The controller uses `@Controller("account_types")` — a top-level route, not nested under `bank-accounts/`. This matches the frontend expectation of `GET /api/account_types` (with the global `/api` prefix from `main.ts`).

This is acceptable because:
- The frontend explicitly calls `/api/account_types`
- It's still registered within `BankAccountsModule` (organizational ownership)
- The route path is an API design decision, not a module boundary violation

## Frontend Contract Verification

The frontend is **fully wired** and ready to consume this endpoint:

```
add-accounts.tsx → useListAccountTypes() → accountTypesQueryFactory → GET /api/account_types
                   returns { accountTypes }    returns AccountType[]     expects { id, name }[]
```

- `accountType.id` → used as `<Select.Item value={...}>` (submitted to create bank account)
- `accountType.name` → used as `<Select.Item>` display text

**No frontend code changes required.**

## Files Changed

| File | Action | Description |
|---|---|---|
| `modules/bank-accounts/presentation/list-account-types.controller.ts` | **Create** | New controller with label map |
| `modules/bank-accounts/bank-accounts.module.ts` | **Edit** | Register controller |
| `shared/swagger/schemas.ts` | **Edit** | Add `AccountTypeResponseSchema` |

Total: 1 new file, 2 edits. Zero migrations. Zero frontend changes.
