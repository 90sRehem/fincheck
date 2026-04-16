## 1. Database Schema & Migration

- [x] 1.1 [api/database] Create `bank-account-schema.ts` in `src/core/database/drizzle/schemas/` — define `bankAccountTypeEnum` (pgEnum), `bankAccounts` table (id, userId, name, type, initialBalance, currentBalance, currency, color, icon, timestamps), index on userId, relation to users table. **Acceptance:** Schema file compiles, follows same patterns as `auth-schema.ts` (text PK, timestamp defaults, FK with cascade delete).
- [x] 1.2 [api/database] Run `bun run --filter @fincheck/api db:generate` to generate SQL migration. **Acceptance:** Migration file created in `src/core/database/drizzle/migrations/` with CREATE TYPE and CREATE TABLE statements.
- [x] 1.3 [api/database] Run `bun run --filter @fincheck/api db:migrate` to apply migration. **Acceptance:** `bank_accounts` table and `bank_account_type` enum exist in PostgreSQL, verified via `db:studio` or direct query.

## 2. Domain Layer

- [x] 2.1 [api/domain] Create `bank-account-type.ts` in `src/modules/bank-accounts/domain/` — `BANK_ACCOUNT_TYPE` as const object with values (checking, savings, credit_card, cash, investment) + derived `BankAccountType` union type. No TypeScript enum. **Acceptance:** Type is `"checking" | "savings" | "credit_card" | "cash" | "investment"`.
- [x] 2.2 [api/domain] Create `bank-account.validator.ts` in `src/modules/bank-accounts/domain/` — extends `ZodValidationStrategy<BankAccountProps>` with Zod schema validating userId (uuid), name (1-100 chars), type (from BANK_ACCOUNT_TYPE values), initialBalance/currentBalance (number), currency (3 chars), color (hex #RRGGBB regex), icon (nullable string). **Acceptance:** Validator rejects invalid inputs per spec scenarios (empty name, invalid type, bad hex color).
- [x] 2.3 [api/domain] Create `bank-account.entity.ts` in `src/modules/bank-accounts/domain/` — extends `Entity<BankAccountProps>`, private constructor, static `create()` factory, getters for all props, `validate()` delegates to `BankAccountValidator`. **Acceptance:** `BankAccount.create()` produces a valid entity, `validate()` returns `success` for valid data and `failure` for invalid.

## 3. Infrastructure Layer

- [x] 3.1 [api/infra] Create `bank-account.repository.ts` in `src/modules/bank-accounts/infra/persistence/` — abstract class with methods: `create(bankAccount)`, `findById(id, userId)`, `findAllByUserId(userId)`, `update(bankAccount)`, `delete(id, userId)`. All queries scoped by userId. **Acceptance:** Abstract class compiles, all methods are abstract with correct signatures.
- [x] 3.2 [api/infra] Create `bank-account.mapper.ts` in `src/modules/bank-accounts/infra/mappers/` — static methods `toDomain(raw)` (numeric string -> number), `toPersistence(entity)` (number -> string), `toResponse(entity)` (dates as ISO strings, no userId). **Acceptance:** Round-trip toDomain(toPersistence(entity)) preserves all values, toResponse excludes userId.
- [x] 3.3 [api/infra] Create `drizzle-bank-account.repository.ts` in `src/modules/bank-accounts/infra/persistence/` — `@Injectable()`, extends `BankAccountRepository`, injects `DRIZZLE_DB`, implements all CRUD methods using Drizzle query builder with `eq()` and `and()` for userId scoping. Uses `BankAccountMapper` for conversions. **Acceptance:** All 5 repository methods work against the database; findById returns null for wrong userId (data isolation).

## 4. Create Bank Account Use Case

- [x] 4.1 [api/use-case] Create `create-bank-account.dto.ts` in `src/modules/bank-accounts/create-bank-account/` — Zod schema for input (name required, type required, initialBalance defaults 0, currency defaults "BRL", color required hex, icon optional null). Export inferred type. **Acceptance:** Schema parses valid input, rejects invalid, applies defaults.
- [x] 4.2 [api/use-case] Create `create-bank-account.use-case.ts` — `@Injectable()`, implements `UseCase<Input, Output>`, receives `BankAccountRepository`, creates entity with `currentBalance = initialBalance`, validates, persists, returns `Either<ValidationFieldsError, BankAccount>`. **Acceptance:** Returns success with created entity for valid input, failure with validation errors for invalid.
- [x] 4.3 [api/controller] Create `create-bank-account.controller.ts` — `@Controller("bank-accounts")`, `@Post()`, `@HttpCode(201)`, parses body with Zod DTO, extracts userId from `@Session()`, calls use case, maps result to response or error. **Acceptance:** `POST /api/bank-accounts` returns 201 with created account, 401 for unauthenticated, validation error for bad input.

## 5. List Bank Accounts Use Case

- [x] 5.1 [api/use-case] Create `list-bank-accounts.use-case.ts` — `@Injectable()`, implements `UseCase<{userId}, BankAccount[]>`, calls `repository.findAllByUserId()`. **Acceptance:** Returns all accounts for the given userId, empty array if none.
- [x] 5.2 [api/controller] Create `list-bank-accounts.controller.ts` — `@Controller("bank-accounts")`, `@Get()`, extracts userId from session, calls use case, maps each entity to response. **Acceptance:** `GET /api/bank-accounts` returns 200 with array, only shows current user's accounts.

## 6. Update Bank Account Use Case

- [x] 6.1 [api/use-case] Create `update-bank-account.dto.ts` — Zod schema with all fields optional (partial update). Same validations as create but each field is `.optional()`. **Acceptance:** Accepts partial input, validates only provided fields.
- [x] 6.2 [api/use-case] Create `update-bank-account.use-case.ts` — `@Injectable()`, finds account by id+userId, returns NotFoundError if missing, calls `entity.update(data)`, validates, persists, returns `Either<NotFoundError | ValidationFieldsError, BankAccount>`. **Acceptance:** Updates only provided fields, returns 404 for non-existent or wrong-user account, validation error for invalid update data.
- [x] 6.3 [api/controller] Create `update-bank-account.controller.ts` — `@Controller("bank-accounts")`, `@Put(":id")`, parses body, extracts userId and id, calls use case, maps NotFoundError to 404 NotFoundException. **Acceptance:** `PUT /api/bank-accounts/:id` returns 200 with updated account, 404 for not found.

## 7. Delete Bank Account Use Case

- [x] 7.1 [api/use-case] Create `delete-bank-account.use-case.ts` — `@Injectable()`, finds by id+userId, returns NotFoundError if missing, deletes, returns `Either<NotFoundError, void>`. **Acceptance:** Deletes the account, returns 404 for non-existent or wrong-user.
- [x] 7.2 [api/controller] Create `delete-bank-account.controller.ts` — `@Controller("bank-accounts")`, `@Delete(":id")`, `@HttpCode(204)`, extracts userId and id, calls use case, maps errors. **Acceptance:** `DELETE /api/bank-accounts/:id` returns 204, 404 for not found.

## 8. Module Wiring

- [x] 8.1 [api/module] Create `bank-accounts.module.ts` in `src/modules/bank-accounts/` — registers all 4 controllers, provides `BankAccountRepository` → `DrizzleBankAccountRepository`, provides all 4 use cases, exports `BankAccountRepository`. **Acceptance:** Module compiles, NestJS can resolve all dependencies.
- [x] 8.2 [api/module] Edit `src/app.module.ts` — import and add `BankAccountsModule` to the imports array. **Acceptance:** Application starts without errors, all 4 endpoints appear in Swagger docs at `/docs`.

## 9. Verification

- [x] 9.1 [api/quality] Run `turbo check-types` — all packages pass type checking. **Acceptance:** Zero type errors across the entire monorepo.
- [x] 9.2 [api/quality] Run `bun run lint` — no Biome lint errors in new files. **Acceptance:** Clean lint output for all new files.
- [ ] 9.3 [api/quality] Manual smoke test — start API (`bun run --filter @fincheck/api dev`), register/login via better-auth, test all 4 CRUD endpoints via curl or Scalar docs UI. **Acceptance:** All scenarios from specs work: create with defaults, list empty, list with data, update partial, update not found, delete, delete not found, data isolation between users.
