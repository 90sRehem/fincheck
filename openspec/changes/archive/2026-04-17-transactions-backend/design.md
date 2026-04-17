# Design: transactions-backend

## Overview

Full NestJS DDD module for transactions, mirroring the `bank-accounts` module architecture. Single controller with 5 endpoints, service-extends-usecase pattern, Drizzle persistence with pagination/filtering.

---

## 1. Domain Layer (`modules/transactions/domain/`)

### 1.1 Value Object — `TRANSACTION_TYPE`

**File:** `domain/value-objects/transaction-type.ts`

```typescript
export const TRANSACTION_TYPE = {
  EXPENSE: "expense",
  REVENUE: "revenue",
} as const;

export type TransactionType =
  (typeof TRANSACTION_TYPE)[keyof typeof TRANSACTION_TYPE];
```

Follows the `as const` pattern from `BANK_ACCOUNT_TYPE`. No TypeScript enums.

### 1.2 Validator — `TransactionValidator`

**File:** `domain/validators/transaction.validator.ts`

Defines `TransactionProps` interface and Zod validation schema.

```typescript
export interface TransactionProps {
  userId: string;
  accountId: string;
  title: string;
  amountCents: number;
  type: TransactionType;
  color: string;
  category: string | null;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

**Validation rules:**
- `userId`: UUID
- `accountId`: UUID
- `title`: string, min 1, max 255
- `amountCents`: integer, min 0 (stored as cents — always positive, `type` determines sign)
- `type`: enum `["expense", "revenue"]`
- `color`: hex color `#RRGGBB` (7 chars, regex validated)
- `category`: nullable string
- `date`: Date object (when the transaction occurred)

### 1.3 Entity — `Transaction`

**File:** `domain/entities/transaction.entity.ts`

Extends `AggregateRoot<TransactionEntityProps>`. Same pattern as `BankAccount`:

```typescript
interface TransactionEntityProps extends TransactionProps {
  createdAt: Date;
  updatedAt: Date;
}

export class Transaction extends AggregateRoot<TransactionEntityProps> {
  constructor(props: TransactionEntityProps, id?: string) { ... }
  validate(): Either<ValidationFieldsError, void> { ... }

  // Getters for each property
  get userId(): string { ... }
  get accountId(): string { ... }
  get title(): string { ... }
  get amountCents(): number { ... }
  get type(): TransactionType { ... }
  get color(): string { ... }
  get category(): string | null { ... }
  get date(): Date { ... }

  // Update method — userId and accountId are immutable
  override update(props: Partial<Omit<TransactionProps, "userId">>): void { ... }
}
```

**Design decisions:**
- `amountCents` stored as positive integer. The `type` field ("expense" / "revenue") determines direction.
- `accountId` is mutable via update (user can reassign transaction to different account).
- `category` is nullable plain string — no FK to categories table (module doesn't exist yet).
- `date` is the user-specified transaction date (not `createdAt`).

### 1.4 Repository Contract — `TransactionRepository`

**File:** `domain/repositories/transaction.repository.ts`

```typescript
export interface ListTransactionsFilters {
  userId: string;
  accountId?: string;
  year?: number;
  month?: number;
  type?: TransactionType;
}

export interface ListTransactionsOptions {
  filters: ListTransactionsFilters;
  page: number;
  limit: number;
  sort: string;
  order: "asc" | "desc";
}

export interface PaginatedResult<T> {
  data: T[];
  totalCount: number;
}

export abstract class TransactionRepository {
  abstract create(transaction: Transaction): Promise<Transaction>;
  abstract findById(id: string, userId: string): Promise<Transaction | null>;
  abstract findMany(options: ListTransactionsOptions): Promise<PaginatedResult<Transaction>>;
  abstract update(transaction: Transaction): Promise<Transaction>;
  abstract delete(id: string, userId: string): Promise<void>;
}
```

**Key difference from `BankAccountRepository`:** `findMany` returns `PaginatedResult` with `totalCount` for the `x-total-count` header. Supports filtering and sorting.

### 1.5 Use Cases

All use-cases are pure domain logic — no `@Injectable()`, no NestJS imports.

#### `CreateTransactionUseCase`

**File:** `domain/use-cases/create-transaction.use-case.ts`

```typescript
export interface CreateTransactionUseCaseInput {
  userId: string;
  accountId: string;
  title: string;
  amountCents: number;
  type: TransactionType;
  color: string;
  category?: string | null;
  date: string; // ISO string from frontend, parsed to Date
}
```

Flow: parse date → create entity → validate → persist → return success.

No domain events emitted yet (balance recalculation deferred).

#### `GetTransactionUseCase`

**File:** `domain/use-cases/get-transaction.use-case.ts`

```typescript
export interface GetTransactionUseCaseInput {
  id: string;
  userId: string;
}
```

Flow: findById → if null return `NotFoundError` → return entity.

#### `ListTransactionsUseCase`

**File:** `domain/use-cases/list-transactions.use-case.ts`

```typescript
export interface ListTransactionsUseCaseInput {
  userId: string;
  accountId?: string;
  year?: number;
  month?: number;
  type?: TransactionType;
  page: number;
  limit: number;
  sort: string;
  order: "asc" | "desc";
}
```

Flow: call `repository.findMany(options)` → return `PaginatedResult<Transaction>`.

#### `UpdateTransactionUseCase`

**File:** `domain/use-cases/update-transaction.use-case.ts`

```typescript
export interface UpdateTransactionUseCaseInput {
  id: string;
  userId: string;
  data: Partial<Pick<Transaction, "accountId" | "title" | "amountCents" | "type" | "color" | "category" | "date">>;
}
```

Flow: findById → if null return `NotFoundError` → update → validate → persist → return updated.

#### `RemoveTransactionUseCase`

**File:** `domain/use-cases/remove-transaction.use-case.ts`

```typescript
export interface RemoveTransactionUseCaseInput {
  id: string;
  userId: string;
}
```

Flow: findById → if null return `NotFoundError` → delete → return success.

### 1.6 Domain Barrel Export

**File:** `domain/index.ts`

Exports: `Transaction`, `TransactionProps`, `TransactionRepository`, all use-cases + input types, `TransactionValidator`, `TRANSACTION_TYPE`, `TransactionType`, repository filter/pagination types.

---

## 2. Infrastructure Layer (`modules/transactions/infra/`)

### 2.1 Drizzle Schema

**File:** `infra/drizzle/schemas/transaction-schema.ts`

```typescript
export const transactionTypeEnum = pgEnum("transaction_type", ["expense", "revenue"]);

export const transactions = pgTable("transactions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  accountId: text("account_id").notNull().references(() => bankAccounts.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  amountCents: integer("amount_cents").notNull(),
  type: transactionTypeEnum("type").notNull(),
  color: text("color").notNull(),
  category: text("category"),
  date: timestamp("date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("transactions_userId_idx").on(table.userId),
  index("transactions_accountId_idx").on(table.accountId),
  index("transactions_date_idx").on(table.date),
]);
```

**Design decisions:**
- `amountCents` as `integer` (not `numeric`) — cents are always whole numbers.
- `date` as `timestamp` — stores the user-specified transaction date.
- Three indexes: `userId` (auth scoping), `accountId` (filter queries), `date` (range queries for year/month filtering).
- FK to `bank_accounts` with `onDelete: cascade` — deleting an account deletes its transactions.
- FK to `users` with `onDelete: cascade` — consistent with bank-accounts pattern.

**Relations:**

```typescript
export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, { fields: [transactions.userId], references: [users.id] }),
  bankAccount: one(bankAccounts, { fields: [transactions.accountId], references: [bankAccounts.id] }),
}));
```

### 2.2 Repository Implementation

**File:** `infra/persistence/drizzle-transaction.repository.ts`

`DrizzleTransactionRepository extends TransactionRepository`:

- `create()` — insert + returning + map to domain
- `findById()` — select where id AND userId
- `findMany()` — dynamic where clause builder:
  - Always filter by `userId`
  - Optional: `accountId` (exact match)
  - Optional: `year` + `month` → date range filter (`date >= start AND date < end`)
  - Optional: `type` (exact match)
  - Dynamic `orderBy` based on `sort` field + `order` direction
  - `.limit(limit).offset((page - 1) * limit)` for pagination
  - Separate count query for `totalCount`
- `update()` — set + where id + returning
- `delete()` — delete where id AND userId

**Date range filtering logic:**

```
year=2026, month=3 → date >= 2026-03-01T00:00:00Z AND date < 2026-04-01T00:00:00Z
year=2026 (no month) → date >= 2026-01-01T00:00:00Z AND date < 2027-01-01T00:00:00Z
```

### 2.3 Mapper

**File:** `infra/mappers/transaction.mapper.ts`

```typescript
export type TransactionRaw = {
  id: string;
  userId: string;
  accountId: string;
  title: string;
  amountCents: number;
  type: string;
  color: string;
  category: string | null;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
};
```

Three methods:
- `toDomain(raw)` → `Transaction` entity
- `toPersistence(entity)` → DB row shape
- `toResponse(entity)` → API response (dates as ISO strings)

**Response shape** (matches frontend `Transaction` type):

```typescript
{
  id: string;
  userId: string;
  accountId: string;
  title: string;
  amountCents: number;
  type: "expense" | "revenue";
  color: string;
  category: string | null;
  date: string;       // ISO string
  createdAt: string;  // ISO string
  updatedAt: string;  // ISO string
}
```

---

## 3. Application Layer (`modules/transactions/application/`)

### 3.1 Services

Each service extends its domain use-case (inheritance pattern per `service-inheritance-refactor` decision):

| Service | Extends | Extra deps? |
|---|---|---|
| `CreateTransactionService` | `CreateTransactionUseCase` | No (domain events deferred) |
| `GetTransactionService` | `GetTransactionUseCase` | No |
| `ListTransactionsService` | `ListTransactionsUseCase` | No |
| `UpdateTransactionService` | `UpdateTransactionUseCase` | No |
| `RemoveTransactionService` | `RemoveTransactionUseCase` | No |

All are simple pass-through wrappers — `@Injectable()` + `constructor(repo) { super(repo) }`.

### 3.2 DTOs (Zod schemas)

#### `CreateTransactionDto`

**File:** `application/create-transaction/create-transaction.dto.ts`

```typescript
export const createTransactionSchema = z.object({
  accountId: z.string().uuid(),
  title: z.string().min(1).max(255),
  amountCents: z.number().int().min(0),
  type: z.enum(["expense", "revenue"]),
  color: z.string().length(7).regex(/^#[0-9A-Fa-f]{6}$/),
  category: z.string().nullable().optional(),
  date: z.string().datetime(), // ISO 8601 string
});
```

#### `UpdateTransactionDto`

**File:** `application/update-transaction/update-transaction.dto.ts`

Same fields as create, all `.optional()`.

#### `ListTransactionsDto`

**File:** `application/list-transactions/list-transactions.dto.ts`

```typescript
export const listTransactionsSchema = z.object({
  accountId: z.string().uuid().optional(),
  year: z.coerce.number().int().min(2000).max(2100).optional(),
  month: z.coerce.number().int().min(1).max(12).optional(),
  type: z.enum(["expense", "revenue"]).optional(),
  _page: z.coerce.number().int().min(1).default(1),
  _limit: z.coerce.number().int().min(1).max(100).default(10),
  _sort: z.string().default("createdAt"),
  _order: z.enum(["asc", "desc"]).default("desc"),
});
```

Note: `z.coerce.number()` for query params (they arrive as strings).

---

## 4. Presentation Layer (`modules/transactions/presentation/`)

### 4.1 Controller

**File:** `presentation/transactions.controller.ts`

Single controller with `@Controller("transactions")` and `@ApiTags("Transactions")`.

| Method | Route | HTTP Status | Description |
|---|---|---|---|
| `@Post()` | POST /api/transactions | 201 Created | Create transaction |
| `@Get()` | GET /api/transactions | 200 OK | List with pagination + filters |
| `@Get(":id")` | GET /api/transactions/:id | 200 OK | Get single transaction |
| `@Put(":id")` | PUT /api/transactions/:id | 200 OK | Update transaction |
| `@Delete(":id")` | DELETE /api/transactions/:id | 204 No Content | Delete transaction |

**Pagination response pattern:**

The `list()` method sets `x-total-count` header on the response:

```typescript
@Get()
async list(@Session() session, @Query() query, @Res({ passthrough: true }) res: Response) {
  // parse query → call service → set header → return data
  res.set("x-total-count", String(result.value.totalCount));
  return result.value.data.map(TransactionMapper.toResponse);
}
```

Uses `@Res({ passthrough: true })` to set headers while still returning the response body normally.

**Auth:** All endpoints use `@Session()` — protected by default global guard.

**Validation:** Zod `safeParse` in controller (same pattern as bank-accounts).

**Error handling:** Maps `NotFoundError` → `NotFoundException`, `ValidationFieldsError` → `BadRequestException`.

---

## 5. Module Registration

### 5.1 `TransactionsModule`

**File:** `modules/transactions/transactions.module.ts`

```typescript
@Module({
  controllers: [TransactionsController],
  providers: [
    { provide: TransactionRepository, useClass: DrizzleTransactionRepository },
    CreateTransactionService,
    GetTransactionService,
    ListTransactionsService,
    UpdateTransactionService,
    RemoveTransactionService,
  ],
  exports: [TransactionRepository],
})
export class TransactionsModule {}
```

Note: Use-cases are NOT registered as providers — the service IS the use-case via inheritance.

### 5.2 Schema Registry Update

**File:** `core/database/drizzle/schema-registry.ts`

Add:
```typescript
import * as transactionSchema from "../../../modules/transactions/infra/drizzle/schemas/transaction-schema";

export const schema = {
  ...authSchema,
  ...bankAccountSchema,
  ...balanceSchema,
  ...transactionSchema,
} as const;
```

### 5.3 Drizzle Config

**File:** `drizzle.config.ts` — No changes needed. The existing glob `./src/modules/*/infra/drizzle/schemas/*` already covers the new module.

### 5.4 App Module

**File:** `app.module.ts`

Add `TransactionsModule` to imports array.

### 5.5 Swagger Schemas

**File:** `shared/swagger/schemas.ts`

Add `TransactionResponseSchema` for Swagger docs.

---

## 6. File Tree (Complete)

```
modules/transactions/
├── transactions.module.ts
├── domain/
│   ├── index.ts
│   ├── entities/
│   │   └── transaction.entity.ts
│   ├── repositories/
│   │   └── transaction.repository.ts
│   ├── use-cases/
│   │   ├── create-transaction.use-case.ts
│   │   ├── get-transaction.use-case.ts
│   │   ├── list-transactions.use-case.ts
│   │   ├── update-transaction.use-case.ts
│   │   └── remove-transaction.use-case.ts
│   ├── validators/
│   │   └── transaction.validator.ts
│   └── value-objects/
│       └── transaction-type.ts
├── application/
│   ├── create-transaction/
│   │   ├── create-transaction.service.ts
│   │   └── create-transaction.dto.ts
│   ├── get-transaction/
│   │   ├── get-transaction.service.ts
│   │   └── get-transaction.dto.ts       (empty — no input beyond route params)
│   ├── list-transactions/
│   │   ├── list-transactions.service.ts
│   │   └── list-transactions.dto.ts
│   ├── update-transaction/
│   │   ├── update-transaction.service.ts
│   │   └── update-transaction.dto.ts
│   └── remove-transaction/
│       ├── remove-transaction.service.ts
│       └── remove-transaction.dto.ts     (empty — no input beyond route params)
├── presentation/
│   └── transactions.controller.ts
└── infra/
    ├── drizzle/
    │   └── schemas/
    │       └── transaction-schema.ts
    ├── persistence/
    │   └── drizzle-transaction.repository.ts
    └── mappers/
        └── transaction.mapper.ts
```

**Total new files:** 22
**Files to modify:** 2 (schema-registry.ts, app.module.ts)
**Swagger addition:** 1 (schemas.ts — add TransactionResponseSchema)

---

## 7. Design Decisions Summary

| Decision | Choice | Rationale |
|---|---|---|
| `amountCents` type | `integer` | Cents are whole numbers. `numeric` (used for bank account `initialBalance`) is for decimal amounts. |
| `date` column | `timestamp` | Stores when the transaction occurred. Separate from `createdAt` (when the record was created). |
| Category handling | Plain `text`, nullable | No categories module exists. Storing raw string avoids FK dependency. |
| Single controller | Yes | Bank-accounts uses 4 separate controllers — this is unnecessarily granular. Single controller with 5 methods is cleaner and standard NestJS practice. |
| Domain events | Deferred | Balance recalculation on transaction CRUD is a separate concern. Adding events now would couple to a flow that doesn't exist yet. |
| `get-transaction` DTO | Skipped | Route params (`id`) + session (`userId`) are sufficient. No body/query to validate. Same for `remove-transaction`. |
| Sorting field validation | Allowlist in repository | Only allow sorting by known columns to prevent SQL injection via dynamic `orderBy`. |
