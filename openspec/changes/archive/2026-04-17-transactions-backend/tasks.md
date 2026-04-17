# Tasks: transactions-backend

## Group 1 — Domain Layer

- [x] 1.1 Create transaction type value object (`apps/api/src/modules/transactions/domain/value-objects/transaction-type.ts`)
  - Files: new file
  - Acceptance: Exports `TRANSACTION_TYPE` as `const` object with `EXPENSE: "expense"` and `REVENUE: "revenue"`, and derived `TransactionType` union type. No TypeScript enums.

- [x] 1.2 Create transaction validator (`apps/api/src/modules/transactions/domain/validators/transaction.validator.ts`)
  - Files: new file
  - Acceptance: Exports `TransactionProps` interface with all fields (`userId`, `accountId`, `title`, `amountCents`, `type`, `color`, `category`, `date`, `createdAt`, `updatedAt`). `TransactionValidator` extends `ZodValidationStrategy<TransactionProps>` with Zod schema: `userId` UUID, `accountId` UUID, `title` min 1 max 255, `amountCents` int min 0, `type` enum, `color` hex 7-char regex, `category` nullable string, `date` Date, timestamps Date.

- [x] 1.3 Create transaction entity (`apps/api/src/modules/transactions/domain/entities/transaction.entity.ts`)
  - Files: new file
  - Acceptance: `Transaction` extends `AggregateRoot<TransactionEntityProps>`. Constructor takes `TransactionEntityProps` + optional `id`. Has `validate()` method using `TransactionValidator`. Getters for all props. `update()` method accepts `Partial<Omit<TransactionProps, "userId">>` and sets `updatedAt`.

- [x] 1.4 Create transaction repository contract (`apps/api/src/modules/transactions/domain/repositories/transaction.repository.ts`)
  - Files: new file
  - Acceptance: Abstract class `TransactionRepository` with methods: `create(transaction)`, `findById(id, userId)`, `findMany(options: ListTransactionsOptions)` returning `PaginatedResult<Transaction>`, `update(transaction)`, `delete(id, userId)`. Exports `ListTransactionsFilters`, `ListTransactionsOptions`, `PaginatedResult<T>` interfaces.

- [x] 1.5 Create `CreateTransactionUseCase` (`apps/api/src/modules/transactions/domain/use-cases/create-transaction.use-case.ts`)
  - Files: new file
  - Acceptance: Implements `UseCase<CreateTransactionUseCaseInput, Transaction>`. Input has `userId`, `accountId`, `title`, `amountCents`, `type`, `color`, `category?`, `date` (string). Parses `date` string to `Date`. Creates entity with `crypto.randomUUID()`. Validates. Persists via repository. Returns `Either<ValidationFieldsError, Transaction>`.

- [x] 1.6 Create `GetTransactionUseCase` (`apps/api/src/modules/transactions/domain/use-cases/get-transaction.use-case.ts`)
  - Files: new file
  - Acceptance: Input `{ id, userId }`. Calls `findById`. Returns `Either<NotFoundError, Transaction>`. Error message: "Transaction not found".

- [x] 1.7 Create `ListTransactionsUseCase` (`apps/api/src/modules/transactions/domain/use-cases/list-transactions.use-case.ts`)
  - Files: new file
  - Acceptance: Input has `userId`, optional filters (`accountId`, `year`, `month`, `type`), pagination (`page`, `limit`, `sort`, `order`). Calls `repository.findMany(options)`. Returns `Either<unknown, PaginatedResult<Transaction>>`.

- [x] 1.8 Create `UpdateTransactionUseCase` (`apps/api/src/modules/transactions/domain/use-cases/update-transaction.use-case.ts`)
  - Files: new file
  - Acceptance: Input `{ id, userId, data }` where `data` is partial pick of mutable fields. Finds by id → not found error if null → updates → validates → persists → returns updated entity. Returns `Either<NotFoundError | ValidationFieldsError, Transaction>`.

- [x] 1.9 Create `RemoveTransactionUseCase` (`apps/api/src/modules/transactions/domain/use-cases/remove-transaction.use-case.ts`)
  - Files: new file
  - Acceptance: Input `{ id, userId }`. Finds by id → not found error if null → deletes → returns `Either<NotFoundError, void>`.

- [x] 1.10 Create domain barrel export (`apps/api/src/modules/transactions/domain/index.ts`)
  - Files: new file
  - Acceptance: Re-exports all entities, repository, use-cases + input types, validator + props, value objects. Follows exact pattern from `bank-accounts/domain/index.ts`.

## Group 2 — Infrastructure Layer

- [x] 2.1 Create Drizzle schema (`apps/api/src/modules/transactions/infra/drizzle/schemas/transaction-schema.ts`)
  - Files: new file
  - Acceptance: `transactionTypeEnum` pgEnum with `["expense", "revenue"]`. `transactions` pgTable with columns: `id` text PK, `userId` text FK→users ON DELETE CASCADE, `accountId` text FK→bankAccounts ON DELETE CASCADE, `title` text NOT NULL, `amountCents` integer NOT NULL, `type` transactionTypeEnum NOT NULL, `color` text NOT NULL, `category` text (nullable), `date` timestamp NOT NULL, `createdAt` timestamp defaultNow NOT NULL, `updatedAt` timestamp $onUpdate NOT NULL. Indexes on `userId`, `accountId`, `date`. Relations defined to `users` and `bankAccounts`.

- [x] 2.2 Create transaction mapper (`apps/api/src/modules/transactions/infra/mappers/transaction.mapper.ts`)
  - Files: new file
  - Acceptance: `TransactionRaw` type matching DB row shape. `TransactionMapper` static class with `toDomain(raw)`, `toPersistence(entity)`, `toResponse(entity)` methods. `toResponse` converts dates to ISO strings and matches frontend `Transaction` type shape. Uses `biome-ignore lint/complexity/noStaticOnlyClass` comment.

- [x] 2.3 Create Drizzle repository implementation (`apps/api/src/modules/transactions/infra/persistence/drizzle-transaction.repository.ts`)
  - Files: new file
  - Acceptance: `@Injectable()` class extending `TransactionRepository`. Injects `DRIZZLE_DB`. Implements all 5 methods. `findMany` builds dynamic where clause for filters, handles year/month date range filtering, supports configurable sort field (allowlisted columns only) + order direction, uses `limit`/`offset` for pagination, runs separate count query for `totalCount`. Returns `PaginatedResult<Transaction>`.

## Group 3 — Application Layer

- [x] 3.1 Create `CreateTransactionService` + DTO (`apps/api/src/modules/transactions/application/create-transaction/`)
  - Files: `create-transaction.service.ts`, `create-transaction.dto.ts`
  - Acceptance: Service is `@Injectable()`, extends `CreateTransactionUseCase`, constructor takes `TransactionRepository` and passes to `super()`. DTO exports `createTransactionSchema` (Zod) with `accountId` UUID, `title` min 1 max 255, `amountCents` int min 0, `type` enum, `color` hex regex, `category` nullable optional, `date` datetime string. Exports `CreateTransactionInput` type.

- [x] 3.2 Create `GetTransactionService` (`apps/api/src/modules/transactions/application/get-transaction/`)
  - Files: `get-transaction.service.ts`
  - Acceptance: `@Injectable()`, extends `GetTransactionUseCase`, simple constructor pass-through.

- [x] 3.3 Create `ListTransactionsService` + DTO (`apps/api/src/modules/transactions/application/list-transactions/`)
  - Files: `list-transactions.service.ts`, `list-transactions.dto.ts`
  - Acceptance: Service extends `ListTransactionsUseCase`. DTO exports `listTransactionsSchema` (Zod) with query params: `accountId` optional UUID, `year` coerce number optional, `month` coerce number 1-12 optional, `type` enum optional, `_page` coerce number default 1, `_limit` coerce number default 10 max 100, `_sort` string default "createdAt", `_order` enum asc/desc default "desc".

- [x] 3.4 Create `UpdateTransactionService` + DTO (`apps/api/src/modules/transactions/application/update-transaction/`)
  - Files: `update-transaction.service.ts`, `update-transaction.dto.ts`
  - Acceptance: Service extends `UpdateTransactionUseCase`. DTO exports `updateTransactionSchema` — same fields as create, all `.optional()`.

- [x] 3.5 Create `RemoveTransactionService` (`apps/api/src/modules/transactions/application/remove-transaction/`)
  - Files: `remove-transaction.service.ts`
  - Acceptance: `@Injectable()`, extends `RemoveTransactionUseCase`, simple constructor pass-through.

## Group 4 — Presentation Layer

- [x] 4.1 Create `TransactionsController` (`apps/api/src/modules/transactions/presentation/transactions.controller.ts`)
  - Files: new file
  - Acceptance: Single `@Controller("transactions")` with `@ApiTags("Transactions")` and `@ApiCookieAuth("better-auth.session_token")`. Five methods:
     - `@Post()` — 201 Created. Parses body with `createTransactionSchema`. Calls `CreateTransactionService`. Returns `TransactionMapper.toResponse()`.
     - `@Get()` — 200 OK. Parses query with `listTransactionsSchema`. Calls `ListTransactionsService`. Sets `x-total-count` response header. Returns array of `TransactionMapper.toResponse()`. Uses `@Res({ passthrough: true })` for header access.
     - `@Get(":id")` — 200 OK. Uses `@Param("id", ParseUUIDPipe)`. Calls `GetTransactionService`. Returns `TransactionMapper.toResponse()`.
     - `@Put(":id")` — 200 OK. Parses body with `updateTransactionSchema`. Calls `UpdateTransactionService`. Returns `TransactionMapper.toResponse()`.
     - `@Delete(":id")` — 204 No Content. Calls `RemoveTransactionService`. Returns `undefined`.
   - All methods use `@Session()` for `userId`. Error mapping: `NotFoundError` → `NotFoundException`, `ValidationFieldsError` → `BadRequestException`. Swagger decorators on each method (`@ApiOperation`, `@ApiResponse`, `@ApiBody`/`@ApiParam` where appropriate).

## Group 5 — Wiring

- [x] 5.1 Create `TransactionsModule` (`apps/api/src/modules/transactions/transactions.module.ts`)
  - Files: new file
  - Acceptance: `@Module` with controller `[TransactionsController]`, providers: repo binding `{ provide: TransactionRepository, useClass: DrizzleTransactionRepository }` + all 5 services. Exports `[TransactionRepository]`. No use-cases registered as standalone providers.

- [x] 5.2 Update schema registry (`apps/api/src/core/database/drizzle/schema-registry.ts`)
  - Files: edit existing file
  - Acceptance: Import `* as transactionSchema from "../../../modules/transactions/infra/drizzle/schemas/transaction-schema"`. Spread into `schema` object alongside existing schemas. Type re-exported.

- [x] 5.3 Register module in `AppModule` (`apps/api/src/app.module.ts`)
  - Files: edit existing file
  - Acceptance: Import `TransactionsModule` from `./modules/transactions/transactions.module`. Add to `imports` array. Placed after `BankAccountsModule` (depends on bank-accounts schema for FK).

- [x] 5.4 Add Swagger response schema (`apps/api/src/shared/swagger/schemas.ts`)
  - Files: edit existing file
  - Acceptance: Add `TransactionResponseSchema: SchemaObject` with properties matching the frontend `Transaction` type: `id` (uuid), `userId` (string), `accountId` (string), `title` (string), `amountCents` (integer), `type` (enum expense/revenue), `color` (string), `category` (string nullable), `date` (date-time), `createdAt` (date-time), `updatedAt` (date-time).

## Group 6 — Migration & Verification

- [x] 6.1 Generate Drizzle migration
  - Command: `bunx drizzle-kit generate` (in `apps/api/`)
  - Acceptance: Migration SQL file created in `src/core/database/drizzle/migrations/`. Contains `CREATE TABLE "transactions"` with all columns, FKs, and indexes. Review SQL before proceeding.

- [x] 6.2 Run migration
  - Command: `bunx drizzle-kit migrate` (in `apps/api/`)
  - Acceptance: Migration applies successfully. `transactions` table exists in PostgreSQL.

- [x] 6.3 Type check
  - Command: `turbo check-types --filter=@fincheck/api`
  - Acceptance: Zero type errors.

- [x] 6.4 Lint check
  - Command: `bun run lint`
  - Acceptance: Zero new lint errors. Existing pre-existing errors acceptable.

- [x] 6.5 Manual endpoint verification
  - Commands: Start API with `bun run --filter @fincheck/api dev`, then test via Swagger UI at `GET /docs` or curl:
     - `POST /api/transactions` — creates transaction, returns 201
     - `GET /api/transactions` — returns array + `x-total-count` header
     - `GET /api/transactions/:id` — returns single transaction
     - `PUT /api/transactions/:id` — updates and returns 200
     - `DELETE /api/transactions/:id` — returns 204
   - Acceptance: All 5 endpoints respond with correct status codes and shapes. Swagger UI shows "Transactions" tag with all endpoints documented.
