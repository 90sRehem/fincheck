# Code Conventions

## Naming Conventions

### Files (Backend)

**Pattern:** kebab-case with feature suffix

```
create-bank-account.controller.ts
create-bank-account.use-case.ts
create-bank-account.dto.ts
bank-account.entity.ts
bank-account.repository.ts
bank-account-type.ts
```

**Exceptions:** Barrel exports use `index.ts`

### Files (Frontend)

**Pattern:** kebab-case, PascalCase exports

```
home-page.tsx         → exports HomePage
session-store.ts      → exports createSessionStore
use-add-account.ts    → exports useAddAccount
add-account-schema.ts → exports AddAccountSchema
```

### Functions/Methods

**Pattern:** camelCase, verb-first for actions

```typescript
// Backend
async function execute(input: CreateBankAccountInput): Promise<Either<...>>
async function createBankAccount(...)
function findById(id: string, userId: string)

// Frontend
function useAddAccount() { ... }
function handleSubmit() { ... }
function useTransactions() { ... }
```

### Constants / Enums

**Pattern:** UPPER_SNAKE for true constants, PascalCase for object enums

```typescript
// TRUE constants
const PORT = process.env.PORT ?? 3333;
const UNAUTHORIZED_STATUS = 401;

// TypeScript "enums" - use as const objects
export const BANK_ACCOUNT_TYPE = {
  CHECKING: "checking",
  SAVINGS: "savings",
  CREDIT_CARD: "credit_card",
  CASH: "cash",
  INVESTMENT: "investment",
} as const;
export type BankAccountType = typeof BANK_ACCOUNT_TYPE[keyof typeof BANK_ACCOUNT_TYPE];

// PostgreSQL enums in Drizzle (allowed)
export const bankAccountTypeEnum = pgEnum("bank_account_type", [
  "checking",
  "savings",
  "credit_card",
  "cash",
  "investment",
]);
```

### Variables

**Pattern:** camelCase, descriptive

```typescript
const userId = session.userId;
const bankAccounts = await repository.findAllByUserId(userId);
const isLoading = useQuery({ ... });
```

---

## Code Organization

### Import Order (Backend)

**Observed pattern (NestJS):**

```typescript
// 1. External
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

// 2. Internal - shared/domain (absolute paths)
import { Entity } from "@/shared/domain/entities/entity";
import { Either, failure, success } from "@/shared/domain/types/either";

// 3. Internal - module/domain (relative)
import { BankAccountProps } from "../validators/bank-account.validator";

// 4. Internal - module/presentation (relative)
import { CreateBankAccountController } from "./create-bank-account.controller";
```

### Import Order (Frontend)

**Observed pattern:**

```typescript
// 1. External - React/router
import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";

// 2. External - libraries
import { useMutation } from "@tanstack/react-query";

// 3. Workspace packages
import { Button } from "@fincheck/design-system";

// 4. Path alias (@/)
import { apiClient } from "@/shared/api";
import { HomePage } from "@/pages/home";

// 5. Relative
import { sessionRoutes } from "./session-routes";
```

### File Structure (Backend)

**Typical use-case file:**

```typescript
// 1. Imports
import { Injectable } from "@nestjs/common";
import { Either, failure, success } from "@/shared/domain/types/either";
import { BankAccountRepository } from "../repositories/bank-account.repository";

// 2. Input type (often in separate DTO file)
export type CreateBankAccountInput = { ... };

// 3. Class definition
@Injectable()
export class CreateBankAccountUseCase {
  // 4. Constructor with dependencies
  constructor(private readonly repository: BankAccountRepository) {}

  // 5. Execute method
  async execute(input: CreateBankAccountInput): Promise<Either<...>> {
    // 6. Implementation
  }
}
```

**Typical entity file:**

```typescript
// 1. Imports from shared/domain
import { Entity } from "@/shared/domain/entities/entity";

// 2. Props interface (from validator)
export type { BankAccountProps } from "../validators/bank-account.validator";

// 3. Extended props interface
interface BankAccountEntityProps extends BankAccountProps {
  createdAt: Date;
  updatedAt: Date;
}

// 4. Class definition
export class BankAccount extends Entity<BankAccountEntityProps> {
  // 5. Private constructor
  private constructor(props: BankAccountEntityProps, id?: string) {
    super(props, id);
  }

  // 6. Factory method
  static create(props: BankAccountProps, id?: string): BankAccount { ... }

  // 7. Validation
  validate(): Either<...> { ... }

  // 8. Getters
  get userId(): string { return this.props.userId; }
  // ...
}
```

### File Structure (Frontend)

**Typical hook file:**

```typescript
// 1. Imports
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/shared/api";
import { AddAccountSchema } from "../model/add-account-schema";

// 2. Hook definition
export function useAddAccount() {
  // 3. State management
  const queryClient = useQueryClient();

  // 4. Return mutation hook
  return useMutation({
    mutationFn: async (data: AddAccountSchema) => {
      const response = await apiClient.post("/bank-accounts", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
}
```

---

## Type Safety

### Approach: Strict TypeScript + Zod

**Backend:**

- DTOs use Zod for input validation
- Entities have full TypeScript types
- Either<L, R> pattern for error handling

**Frontend:**

- Zod schemas for form validation
- TanStack Query for type-safe data fetching
- `as const` for literal types

### Example (Backend DTO)

```typescript
// create-bank-account.dto.ts
import { z } from "zod";

export const createBankAccountSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(["checking", "savings", "credit_card", "cash", "investment"]),
  initialBalance: z.number().default(0),
  currency: z.string().default("BRL"),
  color: z.string(),
  icon: z.string().optional(),
});

export type CreateBankAccountDTO = z.infer<typeof createBankAccountSchema>;
```

### Example (Frontend Schema)

```typescript
// add-account-schema.ts
import { z } from "zod";

export const AddAccountSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  type: z.string().min(1, "Tipo é obrigatório"),
  initialBalance: z.coerce.number().default(0),
  color: z.string().min(1, "Cor é obrigatória"),
});

export type AddAccountSchema = z.infer<typeof AddAccountSchema>;
```

---

## Error Handling

### Backend: Either Pattern

```typescript
import { Either, failure, success } from "@/shared/domain/types/either";
import { ValidationError } from "@/shared/domain/errors/validation-error";

async execute(input: CreateBankAccountInput): Promise<Either<ValidationError, BankAccount>> {
  const validation = this.validator.validate(input);
  if (validation.isFailure) {
    return failure(new ValidationError(validation.value));
  }
  
  const bankAccount = BankAccount.create(input);
  const persisted = await this.repository.create(bankAccount);
  return success(persisted);
}
```

### Frontend: Error Boundaries + API Error Handling

```typescript
// api-client.ts interceptors
error: [
  async (error) => {
    if (error.statusCode === UNAUTHORIZED_STATUS) {
      tokenService.notifyTokenExpired();
    }
    throw error;
  },
],
```

---

## Comments/Documentation

**Observed style:** Minimal comments, code should be self-documenting

```typescript
// Only when necessary - explaining WHY, not WHAT
/** biome-ignore-all lint/style/noMagicNumbers: <explanation> */

// Type exports are often just re-exports
export type { BankAccountProps } from "../validators/bank-account.validator";
```

---

## Linting Rules (Biome)

**From `biome.json`:**

| Rule | Setting | Rationale |
|---|---|---|
| `useImportType` | error | Prefer `import type` for types |
| `noEnum` | error | No TypeScript enums |
| `noDefaultExport` | error | Named exports only |
| `noMagicNumbers` | error | Extract to named constants |
| `noNestedTernary` | error | Avoid nested ternaries |

**Backend override:** `apps/api/biome.json` has `useImportType: off` because NestJS DI requires runtime imports for injectable classes.

---

## Testing Conventions

**Location:** Tests co-located with implementation (`.spec.ts` or `.test.ts`)

**Patterns observed:** Vitest with `@nestjs/testing` for backend, Vitest + Testing Library for frontend

**See TESTING.md for details.**

---

## Exceptions to Conventions

1. **PostgreSQL enums:** Drizzle `pgEnum` is allowed (not TypeScript enums)
2. **Docs app:** Uses ESLint, not Biome (see `apps/docs/package.json`)
3. **API client base URL:** Hardcoded to `http://localhost:8000` (see `apps/web/src/shared/api/api-client.ts:5`) — likely needs env config