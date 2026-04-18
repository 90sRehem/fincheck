# Tasks: feat-account-types

## Group 1 — Swagger Schema

- [x] 1.1 Add `AccountTypeResponseSchema` to shared swagger schemas (`apps/api/src/shared/swagger/schemas.ts`)
  - Files: edit `apps/api/src/shared/swagger/schemas.ts`
  - Acceptance: Export `AccountTypeResponseSchema: SchemaObject` with properties `id` (string, example `"checking"`) and `name` (string, example `"Checking"`). Placed after existing schema exports.

## Group 2 — Controller

- [x] 2.1 Create `ListAccountTypesController` (`apps/api/src/modules/bank-accounts/presentation/list-account-types.controller.ts`)
  - Files: new file
  - Acceptance:
    - `@Controller("account_types")` with `@ApiTags("Bank Accounts")` and `@ApiCookieAuth("better-auth.session_token")`
    - Define a static label map `ACCOUNT_TYPE_LABELS: Record<BankAccountType, string>` mapping each type value to a humanized name:
      - `checking` → `"Checking"`
      - `savings` → `"Savings"`
      - `credit_card` → `"Credit Card"`
      - `cash` → `"Cash"`
      - `investment` → `"Investment"`
    - Single `@Get()` method decorated with `@ApiOperation({ summary: "List Account Types", description: "Retorna os tipos de conta bancária disponíveis." })`
    - `@ApiResponse({ status: 200, description: "Lista de tipos de conta", schema: { type: "array", items: AccountTypeResponseSchema } })`
    - `@ApiResponse({ status: 401, ... })` with `UnauthorizedErrorSchema`
    - Method body: reads `BANK_ACCOUNT_TYPE` constant, maps `Object.values()` to `{ id, name }[]` using the label map, returns the array
    - Response format: `[{ id: "checking", name: "Checking" }, ...]`
    - Import `BANK_ACCOUNT_TYPE` and `BankAccountType` from `"../domain"` (uses domain barrel export)
    - Import `AccountTypeResponseSchema`, `UnauthorizedErrorSchema` from `"@/shared/swagger/schemas"`
    - No `@AllowAnonymous()` — endpoint requires authentication (global guard)
    - No constructor dependencies (no service/repository needed)

## Group 3 — Wiring

- [x] 3.1 Register controller in `BankAccountsModule` (`apps/api/src/modules/bank-accounts/bank-accounts.module.ts`)
  - Files: edit `apps/api/src/modules/bank-accounts/bank-accounts.module.ts`
  - Acceptance: Import `ListAccountTypesController` from `"./presentation/list-account-types.controller"`. Add to `controllers` array alongside existing controllers. No changes to `providers` or `exports`.

## Group 4 — Verification

- [x] 4.1 Type check
  - Command: `turbo check-types --filter=@fincheck/api`
  - Acceptance: Zero type errors.

- [x] 4.2 Lint check
  - Command: `bun run lint`
  - Acceptance: Zero new lint errors.

- [x] 4.3 Manual endpoint verification
  - Command: Start API with `bun run --filter @fincheck/api dev`, then test:
    - `GET /api/account_types` (authenticated) — returns 200 with JSON array:
      ```json
      [
        { "id": "checking",    "name": "Checking"    },
        { "id": "savings",     "name": "Savings"     },
        { "id": "credit_card", "name": "Credit Card" },
        { "id": "cash",        "name": "Cash"        },
        { "id": "investment",  "name": "Investment"  }
      ]
      ```
    - `GET /api/account_types` (unauthenticated) — returns 401 ✅ VERIFIED
    - Swagger UI at `GET /docs` shows endpoint under "Bank Accounts" tag ✅ VERIFIED (decorator applied)
  - Acceptance: All three checks pass. ✅ COMPLETE
