## 1. Cross-Module Event Infrastructure

- [x] 1.1 [api/shared] Create `BankAccountCreatedEvent` class in `src/shared/domain/events/bank-account-created.event.ts` — implements `DomainEvent` interface with properties: `aggregateId` (Id), `userId` (string), `initialBalance` (number), `currency` (string), `occurredAt` (Date). Export from `src/shared/domain/events/index.ts`. **Acceptance:** Class compiles, `getAggregateId()` returns the bank account Id, all properties are readonly.

## 2. Promote BankAccount to AggregateRoot

- [x] 2.1 [api/bank-accounts] Change `BankAccount` entity to extend `AggregateRoot` instead of `Entity` in `src/modules/bank-accounts/domain/entities/bank-account.entity.ts`. Update import from `@/shared/domain/entities/entity` to `@/shared/domain/entities/aggregate-root`. Constructor calls `super(props, id)` (AggregateRoot constructor signature is identical). **Acceptance:** `BankAccount` instance has `addDomainEvent()`, `domainEvents`, and `clearEvents()` methods. Existing tests/functionality unchanged.

- [x] 2.2 [api/bank-accounts] Update `CreateBankAccountUseCase` in `src/modules/bank-accounts/domain/use-cases/create-bank-account.use-case.ts` — after creating the `BankAccount` instance and before returning, call `bankAccount.addDomainEvent(new BankAccountCreatedEvent(...))` with the account's id, userId, initialBalance, and currency. Import `BankAccountCreatedEvent` from `@/shared/domain/events`. **Acceptance:** After `execute()`, the returned `BankAccount` aggregate has exactly one domain event in its `domainEvents` array. Event is NOT emitted on validation failure.

## 3. Wire Event Dispatch in CreateBankAccountService

- [x] 3.1 [api/bank-accounts] Refactor `CreateBankAccountService` in `src/modules/bank-accounts/application/create-bank-account/create-bank-account.service.ts` — change from `extends CreateBankAccountUseCase` to composition pattern. Inject both `CreateBankAccountUseCase` and `DomainEventDispatcher` via constructor. The `execute()` method calls `this.useCase.execute(input)`, then on success calls `this.dispatcher.dispatchAll(result.value)` to emit buffered events. **Acceptance:** Service compiles, dispatches events after successful creation, does NOT dispatch on validation failure.

- [x] 3.2 [api/bank-accounts] Update `bank-accounts.module.ts` — ensure `CreateBankAccountUseCase` is registered as a provider (it already is) and `DomainEventDispatcher` is available via the global `EventsModule`. No new imports needed since `EventsModule` is `@Global()`. **Acceptance:** NestJS resolves all dependencies for `CreateBankAccountService` without errors.

## 4. Remove currentBalance from BankAccounts

- [x] 4.1 [api/bank-accounts] Remove `currentBalance` from `BankAccountProps` interface in `src/modules/bank-accounts/domain/validators/bank-account.validator.ts` — remove the property and its Zod validation rule. **Acceptance:** `BankAccountProps` no longer has `currentBalance`. Validator schema has no `currentBalance` field.

- [x] 4.2 [api/bank-accounts] Remove `currentBalance` getter from `BankAccount` entity in `src/modules/bank-accounts/domain/entities/bank-account.entity.ts`. Remove `currentBalance` from the `Omit` list in the `update()` method signature (it was already omitted). **Acceptance:** Entity compiles without `currentBalance` property.

- [x] 4.3 [api/bank-accounts] Update `CreateBankAccountUseCase` in `src/modules/bank-accounts/domain/use-cases/create-bank-account.use-case.ts` — remove `currentBalance: initialBalance` from the `BankAccount` constructor call. Update `CreateBankAccountUseCaseInput` to remove `currentBalance` from the `Omit` list. **Acceptance:** Use case creates BankAccount without `currentBalance`.

- [x] 4.4 [api/bank-accounts] Update `BankAccountMapper` in `src/modules/bank-accounts/infra/mappers/bank-account.mapper.ts` — remove `currentBalance` from `BankAccountRaw` type, `toDomain()`, `toPersistence()`, and `toResponse()` methods. **Acceptance:** Mapper compiles, round-trip works without `currentBalance`.

- [x] 4.5 [api/bank-accounts] Remove `currentBalance` column from Drizzle schema in `src/modules/bank-accounts/infra/drizzle/schemas/bank-account-schema.ts`. **Acceptance:** Schema compiles, `currentBalance` column definition is gone.

## 5. Balances Module — Domain Layer

- [x] 5.1 [api/balances] Create directory structure: `src/modules/balances/domain/entities/`, `src/modules/balances/domain/repositories/`, `src/modules/balances/domain/use-cases/`, `src/modules/balances/domain/validators/`, `src/modules/balances/application/`, `src/modules/balances/presentation/`, `src/modules/balances/infra/drizzle/schemas/`, `src/modules/balances/infra/persistence/`, `src/modules/balances/infra/mappers/`. **Acceptance:** All directories exist.

- [x] 5.2 [api/balances] Create `Balance` entity in `src/modules/balances/domain/entities/balance.entity.ts` — extends `Entity<BalanceProps>`. Props: `userId` (string), `bankAccountId` (string), `amountCents` (number), `currency` (string). Getters for all props. Static factory `fromAccountCreated(event: BankAccountCreatedEvent)` that converts `initialBalance` to cents (`Math.round(initialBalance * 100)`). `validate()` method using `BalanceValidator`. **Acceptance:** `Balance.fromAccountCreated()` correctly converts decimal to cents. Entity compiles with all getters.

- [x] 5.3 [api/balances] Create `BalanceValidator` in `src/modules/balances/domain/validators/balance.validator.ts` — extends `ZodValidationStrategy<BalanceProps>`. Validates: `userId` (uuid), `bankAccountId` (uuid), `amountCents` (integer), `currency` (3-char string). **Acceptance:** Validator rejects non-integer amountCents, invalid UUIDs, wrong currency length.

- [x] 5.4 [api/balances] Create `BalanceRepository` abstract class in `src/modules/balances/domain/repositories/balance.repository.ts` — methods: `create(balance: Balance): Promise<Balance>`, `findAllByUserId(userId: string): Promise<Balance[]>`. Repository returns raw rows — no aggregation. **Acceptance:** Abstract class compiles with correct signatures. `findAllByUserId` returns `Balance[]`, not a pre-aggregated shape.

- [x] 5.5 [api/balances] Create `GetUserBalancesUseCase` in `src/modules/balances/domain/use-cases/get-user-balances.use-case.ts` — implements `UseCase`. Takes `{ userId: string }`, calls `repository.findAllByUserId(userId)`, then aggregates in-memory: `reduce()` over the array grouping by `currency`, summing `amountCents`. Returns `Either<never, { amountCents: number; currency: string }[]>`. **Acceptance:** Use case correctly aggregates multiple rows of the same currency into one entry. Single-currency and multi-currency cases both work. Empty array returns `[]`. Logic is testable without a database mock — only needs a `BalanceRepository` mock returning `Balance[]`.

- [x] 5.6 [api/balances] Create domain barrel export `src/modules/balances/domain/index.ts` — exports Balance entity, BalanceRepository, GetUserBalancesUseCase, BalanceValidator. **Acceptance:** All domain types importable from `../../domain`.

## 6. Balances Module — Infrastructure Layer

- [x] 6.1 [api/balances] Create `balance-schema.ts` in `src/modules/balances/infra/drizzle/schemas/` — define `balances` pgTable with columns: `id` (text PK), `userId` (text, FK → users.id CASCADE), `bankAccountId` (text, FK → bank_accounts.id CASCADE, UNIQUE), `amountCents` (bigint, NOT NULL, default 0), `currency` (text, NOT NULL, default 'BRL'), `updatedAt` (timestamp, NOT NULL). Add index on `userId`. Add relations to `users` and `bankAccounts`. **Acceptance:** Schema compiles, follows same patterns as `bank-account-schema.ts`.

- [x] 6.2 [api/balances] Create `BalanceMapper` in `src/modules/balances/infra/mappers/balance.mapper.ts` — static methods: `toDomain(raw)` converts bigint string to number, `toPersistence(entity)` converts number to string, `toAggregatedResponse(rows)` maps SQL aggregation result to `{ amountCents, currency }[]`. **Acceptance:** `toDomain` correctly parses bigint strings. `toPersistence` outputs string for bigint column.

- [x] 6.3 [api/balances] Create `DrizzleBalanceRepository` in `src/modules/balances/infra/persistence/drizzle-balance.repository.ts` — `@Injectable()`, extends `BalanceRepository`, injects `DRIZZLE_DB`. `create()` inserts via mapper. `findAllByUserId()` queries `SELECT * FROM balances WHERE user_id = ?` and maps each row to a `Balance` entity via `BalanceMapper.toDomain()`. No aggregation in the query — returns raw `Balance[]`. **Acceptance:** Repository creates balance rows and returns all rows for a user as `Balance[]`. No SQL `GROUP BY` or `SUM` — that logic lives in the use-case.

## 7. Balances Module — Application & Presentation

- [x] 7.1 [api/balances] Create `GetUserBalancesService` in `src/modules/balances/application/get-user-balances/get-user-balances.service.ts` — `@Injectable()`, wraps `GetUserBalancesUseCase`. **Acceptance:** Service compiles, delegates to use case.

- [x] 7.2 [api/balances] Create `OnBankAccountCreatedListener` in `src/modules/balances/application/on-bank-account-created/on-bank-account-created.listener.ts` — `@Injectable()`, uses `@OnEvent('BankAccountCreatedEvent')` decorator. Injects `BalanceRepository`. Creates a `Balance` entity via `Balance.fromAccountCreated(event)`, validates, and persists. Logs errors but does not throw (eventual consistency). **Acceptance:** Listener creates a balance row when event is emitted. Errors are logged, not thrown.

- [x] 7.3 [api/balances] Create `GetUserBalancesController` in `src/modules/balances/presentation/get-user-balances.controller.ts` — `@Controller("balances")`, `@Get()`, extracts userId from `@Session()`, calls `GetUserBalancesService`, returns `{ amountCents, currency }[]`. Add Swagger decorators (`@ApiTags`, `@ApiCookieAuth`, `@ApiOperation`, `@ApiResponse`). **Acceptance:** `GET /api/balances` returns 200 with aggregated balances, 401 for unauthenticated.

## 8. Module Wiring & Schema Registration

- [x] 8.1 [api/balances] Create `balances.module.ts` in `src/modules/balances/` — registers `GetUserBalancesController`, provides `BalanceRepository` → `DrizzleBalanceRepository`, provides `GetUserBalancesUseCase`, `GetUserBalancesService`, `OnBankAccountCreatedListener`. **Acceptance:** Module compiles, NestJS resolves all dependencies.

- [x] 8.2 [api/core] Update `schema-registry.ts` in `src/core/database/drizzle/` — import and spread `balanceSchema` from `../../../modules/balances/infra/drizzle/schemas/balance-schema`. **Acceptance:** `schema` object includes balance table and relations.

- [x] 8.3 [api/core] Update `app.module.ts` — import and add `BalancesModule` to the imports array (after `BankAccountsModule`). **Acceptance:** Application starts without errors, `GET /api/balances` appears in Swagger docs.

## 9. Database Migration

- [x] 9.1 [api/database] Run `bun run --filter @fincheck/api db:generate` to generate migration for: dropping `current_balance` column from `bank_accounts`, creating `balances` table with all columns/indexes/constraints. **Acceptance:** Migration SQL file created in `src/core/database/drizzle/migrations/`.

- [x] 9.2 [api/database] Run `bun run --filter @fincheck/api db:migrate` to apply migration. **Acceptance:** `balances` table exists in PostgreSQL, `current_balance` column is gone from `bank_accounts`. Verified via `db:studio`.

## 10. Frontend Fix

- [x] 10.1 [web/pages] Update `apps/web/src/pages/home/api/accounts.ts` — change `createAccount` to call `api/bank-accounts` instead of `api/accounts`. Remove `userId` from request body (backend uses session). Change `amount` field to `initialBalance`. Update `Account` type: remove `amount` field, add `initialBalance` (number), remove `userId` from type, align `type` with backend enum values (`checking | savings | credit_card | cash | investment`), change `color` from union to `string`. Update `listAccounts` to call `api/bank-accounts` (no userId query param). Update `ListAccountsRequest` to remove `userId` (use empty object or no params). **Acceptance:** Frontend calls correct endpoints, types match backend response shape, no TypeScript errors.

- [x] 10.2 [web/entities] Update `apps/web/src/entities/balance/api/get-balance.ts` — the endpoint `api/balances/${userId}` works as-is (backend ignores the path param and uses session). Optionally simplify to `api/balances` if desired. Verify `BalanceResponse` type matches backend response. **Acceptance:** Balance API call works against the new backend endpoint. No runtime errors.

## 11. Verification

- [x] 11.1 [api/quality] Run `turbo check-types` — all packages pass type checking with zero errors. **Acceptance:** Clean output across entire monorepo.

- [x] 11.2 [api/quality] Run `bun run lint` — no Biome lint errors in new or modified files. **Acceptance:** Clean lint output.

- [ ] 11.3 [api/quality] Manual smoke test — start API (`bun run --filter @fincheck/api dev`), authenticate, create a bank account via `POST /api/bank-accounts`, then call `GET /api/balances` and verify the balance row was created with correct `amountCents` and `currency`. Test with multiple accounts in different currencies. **Acceptance:** All scenarios from specs pass: single currency aggregation, multi-currency aggregation, empty array for no accounts, data isolation between users.

- [ ] 11.4 [web/quality] Manual smoke test — start web (`bun run --filter @fincheck/web dev`), verify accounts page loads without console errors, verify balance component displays correctly. **Acceptance:** No 404 errors on API calls, balance renders with correct formatting.
