# Code Conventions Decisions

## Context

During the exploration and planning of the first domain module (Bank Accounts), several code convention decisions were made that apply to the entire project going forward. These need to be captured and enforced via AGENTS.md.

## Findings

### No TypeScript Enums (Project-Wide Rule)

**Decision:** Never use `enum` or `const enum` in TypeScript anywhere in the monorepo.

**Alternative:** Use `as const` objects with derived union types:

```ts
// Correct pattern
export const BANK_ACCOUNT_TYPE = {
  CHECKING: "checking",
  SAVINGS: "savings",
  CREDIT_CARD: "credit_card",
  CASH: "cash",
  INVESTMENT: "investment",
} as const;

export type BankAccountType = typeof BANK_ACCOUNT_TYPE[keyof typeof BANK_ACCOUNT_TYPE];
// Result: "checking" | "savings" | "credit_card" | "cash" | "investment"
```

**Why:**
- TS enums emit JavaScript code (runtime objects) — `as const` is erased at compile time
- TS enums have quirky nominal typing — `as const` produces standard union types
- TS enums don't work well with `isolatedModules` (which is enabled in base tsconfig)
- `as const` objects can be iterated with `Object.values()`, used as lookup maps, and spread naturally

**Exception:** PostgreSQL `pgEnum` in Drizzle schemas is allowed — it creates a database-level type constraint, which is valuable for data integrity. This is not a TypeScript enum.

**Zod integration:**
```ts
// With as const + pgEnum
import { BANK_ACCOUNT_TYPE } from "../domain/bank-account-type";
z.enum(Object.values(BANK_ACCOUNT_TYPE) as [string, ...string[]])
```

### File Naming for Type Constants

- Use descriptive name without "enum" suffix: `bank-account-type.ts` not `bank-account-type.enum.ts`
- Export both the const object (UPPER_SNAKE_CASE) and the derived type (PascalCase)

### Controller-per-Use-Case Pattern

**Decision:** Each use case gets its own controller class with the same route prefix.

```
create-bank-account/
├── create-bank-account.controller.ts  # @Controller("bank-accounts") @Post()
├── create-bank-account.use-case.ts
└── create-bank-account.dto.ts

list-bank-accounts/
├── list-bank-accounts.controller.ts   # @Controller("bank-accounts") @Get()
└── list-bank-accounts.use-case.ts
```

NestJS merges routes from multiple controllers with the same prefix. This keeps each controller single-responsibility and aligned with the use-case folder structure.

### Dual Validation Strategy

**Decision:** Validate at two layers:
1. **DTO level (controller):** Zod schema `.parse(body)` — catches malformed HTTP input
2. **Entity level (domain):** `entity.validate()` via `ZodValidationStrategy` — enforces domain invariants

This is defense in depth. The DTO catches missing fields, wrong types, format violations. The entity validates business rules that may not be expressible in a DTO (e.g., cross-field constraints, invariants that depend on entity state).

### Repository as Abstract Class

**Decision:** Repository interfaces are abstract classes, not TypeScript interfaces.

```ts
// Correct — NestJS can use this as DI token
export abstract class BankAccountRepository {
  abstract create(bankAccount: BankAccount): Promise<void>;
  // ...
}

// In module:
{ provide: BankAccountRepository, useClass: DrizzleBankAccountRepository }
```

NestJS DI requires a class token for `provide:`. TypeScript interfaces are erased at runtime and cannot be used as injection tokens without workarounds (string/symbol tokens).

### Mapper with 3 Directions

**Decision:** Each entity gets a mapper with three static methods:
- `toDomain(raw)` — database row -> domain entity
- `toPersistence(entity)` — domain entity -> database row
- `toResponse(entity)` — domain entity -> API response DTO

This keeps conversion logic centralized and testable.

## Decisions / Open Questions

- Decision: All conventions above apply project-wide and should be documented in `AGENTS.md`
- Decision: The no-enum rule needs to be added to the root `AGENTS.md` under a new "Code Conventions" section
- Open: Need a shared error-to-HTTP mapping strategy — currently inline in controllers, may need an exception filter or shared utility as more modules are added

## References

- `AGENTS.md` — root monorepo agent instructions (where the no-enum rule must be added)
- `apps/api/AGENTS.md` — backend-specific conventions
- `packages/ts-config/base.json` — `isolatedModules: true` setting that affects enum behavior
- `apps/api/src/shared/domain/validators/zod-validation-strategy.ts` — validation pattern
- `apps/api/src/shared/domain/types/use-case.ts` — use case interface
