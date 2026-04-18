## 1. Currencies Module — Backend [api/modules]

- [ ] 1.1 Create Drizzle schema for `currencies` table (`apps/api/src/modules/currencies/infra/drizzle/schemas/currency-schema.ts`)
  - Files: new file
  - Acceptance: `currencies` pgTable with columns `id` (text PK), `code` (text, unique), `name` (text). Export `currencies` and `currenciesRelations` (empty for now).

- [ ] 1.2 Register currencies schema in schema-registry (`apps/api/src/core/database/drizzle/schema-registry.ts`)
  - Files: `schema-registry.ts`
  - Acceptance: `currencySchema` imported and spread into `schema` object. TypeScript compiles.

- [ ] 1.3 Add currencies to seed script (`apps/api/src/core/database/seed.ts`)
  - Files: `seed.ts`
  - Acceptance: `CURRENCIES` array with `{ id: "BRL", code: "BRL", name: "Real Brasileiro" }`, `{ id: "USD", code: "USD", name: "US Dollar" }`, `{ id: "EUR", code: "EUR", name: "Euro" }`. Inserted with `onConflictDoNothing()`.

- [ ] 1.4 Create Currency domain entity (`apps/api/src/modules/currencies/domain/entities/currency.entity.ts`)
  - Files: new file
  - Acceptance: Readonly class with `id`, `code`, `name` properties. Same pattern as `Color` entity.

- [ ] 1.5 Create CurrencyRepository abstract port (`apps/api/src/modules/currencies/domain/repositories/currency.repository.ts`)
  - Files: new file
  - Acceptance: Abstract class with `findAll(): Promise<Currency[]>` method.

- [ ] 1.6 Create domain barrel export (`apps/api/src/modules/currencies/domain/index.ts`)
  - Files: new file
  - Acceptance: Re-exports `Currency`, `CurrencyRepository`.

- [ ] 1.7 Create ListCurrenciesUseCase (`apps/api/src/modules/currencies/domain/use-cases/list-currencies.use-case.ts`)
  - Files: new file
  - Acceptance: Pure use-case (no @Injectable) that calls `currencyRepository.findAll()`. Returns `Either<unknown, Currency[]>`.

- [ ] 1.8 Create ListCurrenciesService (`apps/api/src/modules/currencies/application/list-currencies/list-currencies.service.ts`)
  - Files: new file
  - Acceptance: `@Injectable()` service that extends `ListCurrenciesUseCase`. Constructor injects `CurrencyRepository`.

- [ ] 1.9 Create CurrencyMapper (`apps/api/src/modules/currencies/infra/mappers/currency.mapper.ts`)
  - Files: new file
  - Acceptance: Static methods `toDomain(raw)` and `toResponse(entity)`. Response shape: `{ id, code, name }`.

- [ ] 1.10 Create DrizzleCurrencyRepository (`apps/api/src/modules/currencies/infra/persistence/drizzle-currency.repository.ts`)
  - Files: new file
  - Acceptance: `@Injectable()` class extending `CurrencyRepository`. Injects `DRIZZLE_DB`. `findAll()` selects from `currencies` table, maps via `CurrencyMapper.toDomain()`.

- [ ] 1.11 Create ListCurrenciesController (`apps/api/src/modules/currencies/presentation/list-currencies.controller.ts`)
  - Files: new file
  - Acceptance: `GET /currencies` with `@ApiTags("Currencies")`, `@ApiCookieAuth`, `@ApiOperation`, `@ApiResponse`. Returns `CurrencyMapper.toResponse()` array.

- [ ] 1.12 Create CurrenciesModule and register in app (`apps/api/src/modules/currencies/currencies.module.ts`, `apps/api/src/app.module.ts`)
  - Files: new file + `app.module.ts`
  - Acceptance: Module registers controller, service, repository binding. Imported in `app.module.ts`. `GET /api/v1/currencies` responds correctly.

- [ ] 1.13 Add CurrencyResponseSchema to Swagger schemas (`apps/api/src/shared/swagger/schemas.ts`)
  - Files: `schemas.ts`
  - Acceptance: Schema object with `id`, `code`, `name` properties documented for Swagger.

## 2. Bank Accounts Schema Migration [api/database]

- [ ] 2.1 Update bank-account Drizzle schema — replace text/pgEnum columns with FK columns (`apps/api/src/modules/bank-accounts/infra/drizzle/schemas/bank-account-schema.ts`)
  - Files: `bank-account-schema.ts`
  - Acceptance: Remove `color: text()`, `type: bankAccountTypeEnum()`, `currency: text()`. Add `colorId: text("color_id").notNull().references(() => colors.id)`, `accountTypeId: text("account_type_id").notNull().references(() => accountTypes.id)`, `currencyId: text("currency_id").notNull().default("BRL").references(() => currencies.id)`. Remove `bankAccountTypeEnum` export. Update `bankAccountsRelations` to include `one()` for `color`, `accountType`, `currency`.

- [ ] 2.2 Generate Drizzle migration (`bun run --filter @fincheck/api db:generate`)
  - Files: new migration file in `apps/api/src/core/database/drizzle/migrations/`
  - Acceptance: Migration file generated. Review for correctness.

- [ ] 2.3 Edit migration to include DML data conversion
  - Files: generated migration SQL file
  - Acceptance: Before dropping old columns, migration includes:
    1. `ALTER TABLE bank_accounts ADD COLUMN color_id text;`
    2. `UPDATE bank_accounts SET color_id = c.id FROM colors c WHERE c.hex = bank_accounts.color;`
    3. `UPDATE bank_accounts SET color_id = 'gray' WHERE color_id IS NULL;`
    4. `ALTER TABLE bank_accounts ALTER COLUMN color_id SET NOT NULL;`
    5. Similar for `account_type_id` (from `type` column) and `currency_id` (from `currency` column)
    6. `ALTER TABLE bank_accounts DROP COLUMN color;`
    7. `ALTER TABLE bank_accounts DROP COLUMN type;`
    8. `ALTER TABLE bank_accounts DROP COLUMN currency;`
    9. `DROP TYPE bank_account_type;`
    10. FK constraints added

- [ ] 2.4 Run migration and seed (`bun run --filter @fincheck/api db:migrate && bun run --filter @fincheck/api db:seed`)
  - Files: none (runtime)
  - Acceptance: Migration applies without errors. Existing `bank_accounts` rows have valid `color_id`, `account_type_id`, `currency_id`. Drizzle Studio shows correct FK relationships.

## 3. Bank Account Domain Layer Updates [api/domain]

- [ ] 3.1 Remove `bank-account-type.ts` value object (`apps/api/src/modules/bank-accounts/domain/value-objects/bank-account-type.ts`)
  - Files: delete file
  - Acceptance: File removed. No remaining imports of `BANK_ACCOUNT_TYPE` from this file (will be replaced by accountTypeId string).

- [ ] 3.2 Update BankAccountValidator — replace hex/enum validation with ID validation (`apps/api/src/modules/bank-accounts/domain/validators/bank-account.validator.ts`)
  - Files: `bank-account.validator.ts`
  - Acceptance: `BankAccountProps` interface changes: `color: string` → `colorId: string`, `type: BankAccountType` → `accountTypeId: string`, `currency: string` → `currencyId: string`. Zod schema validates all three as `z.string().min(1, "...")`. No hex regex, no enum. Remove `BANK_ACCOUNT_TYPE` import.

- [ ] 3.3 Update BankAccount entity — rename props and getters (`apps/api/src/modules/bank-accounts/domain/entities/bank-account.entity.ts`)
  - Files: `bank-account.entity.ts`
  - Acceptance: Getters change: `color` → `colorId`, `type` → `accountTypeId`, `currency` → `currencyId`. `update()` method excludes `userId`, `initialBalance` (same as before) but uses new prop names.

- [ ] 3.4 Update domain barrel exports (`apps/api/src/modules/bank-accounts/domain/index.ts`)
  - Files: `domain/index.ts`
  - Acceptance: Remove export of `BANK_ACCOUNT_TYPE` / `BankAccountType`. Export updated entity and props types.

## 4. Bank Account Application Layer Updates [api/application]

- [ ] 4.1 Update CreateBankAccount DTO — accept IDs instead of raw values (`apps/api/src/modules/bank-accounts/application/create-bank-account/create-bank-account.dto.ts`)
  - Files: `create-bank-account.dto.ts`
  - Acceptance: Schema changes: `color` (hex regex) → `colorId: z.string().min(1)`, `type` (enum) → `accountTypeId: z.string().min(1)`, `currency` (string) → `currencyId: z.string().default("BRL")`. Remove `BANK_ACCOUNT_TYPE` import.

- [ ] 4.2 Update UpdateBankAccount DTO — accept IDs instead of raw values (`apps/api/src/modules/bank-accounts/application/update-bank-account/update-bank-account.dto.ts`)
  - Files: `update-bank-account.dto.ts`
  - Acceptance: Schema changes same pattern as create DTO. All fields optional. Remove `BANK_ACCOUNT_TYPE` import.

- [ ] 4.3 Update CreateBankAccountUseCase — use new prop names (`apps/api/src/modules/bank-accounts/domain/use-cases/create-bank-account.use-case.ts`)
  - Files: `create-bank-account.use-case.ts`
  - Acceptance: Input interface uses `colorId`, `accountTypeId`, `currencyId`. Entity construction uses new prop names. `BankAccountCreatedEvent` still receives `currencyId` (update event if needed).

- [ ] 4.4 Update UpdateBankAccountUseCase — use new prop names (`apps/api/src/modules/bank-accounts/domain/use-cases/update-bank-account.use-case.ts`)
  - Files: `update-bank-account.use-case.ts`
  - Acceptance: Input `data` partial uses new prop names `colorId`, `accountTypeId`, `currencyId`.

- [ ] 4.5 Update ListBankAccountsUseCase if needed (`apps/api/src/modules/bank-accounts/domain/use-cases/list-bank-accounts.use-case.ts`)
  - Files: `list-bank-accounts.use-case.ts`
  - Acceptance: No changes expected to use-case logic itself, but verify it compiles with updated entity types.

## 5. Bank Account Infrastructure Layer Updates [api/infra]

- [ ] 5.1 Update BankAccountMapper — handle relational data (`apps/api/src/modules/bank-accounts/infra/mappers/bank-account.mapper.ts`)
  - Files: `bank-account.mapper.ts`
  - Acceptance:
    - `BankAccountRaw` type updated: `colorId` replaces `color`, `accountTypeId` replaces `type`, `currencyId` replaces `currency`. Add optional nested relation types for `color`, `accountType`, `currency`.
    - `toDomain()` maps `colorId`, `accountTypeId`, `currencyId` to entity props.
    - `toPersistence()` maps entity `colorId`, `accountTypeId`, `currencyId` to column values.
    - `toResponse()` returns enriched shape with nested `color: { id, name, hex }`, `accountType: { id, name }`, `currency: { id, code, name }`. Accepts relations data as second parameter or as part of raw.

- [ ] 5.2 Update DrizzleBankAccountRepository — use relational queries (`apps/api/src/modules/bank-accounts/infra/persistence/drizzle-bank-account.repository.ts`)
  - Files: `drizzle-bank-account.repository.ts`
  - Acceptance:
    - `findAllByUserId()` uses `db.query.bankAccounts.findMany({ where: ..., with: { color: true, accountType: true, currency: true } })` or equivalent JOINs.
    - `findById()` also fetches relations.
    - `create()` and `update()` work with FK column values (insert/update only IDs, not relation objects).
    - Mapper calls updated to pass relation data.

## 6. Bank Account Presentation Layer Updates [api/presentation]

- [ ] 6.1 Update CreateBankAccountController — Swagger schema with new field names (`apps/api/src/modules/bank-accounts/presentation/create-bank-account.controller.ts`)
  - Files: `create-bank-account.controller.ts`
  - Acceptance: Swagger `@ApiBody` schema reflects `colorId`, `accountTypeId`, `currencyId`. Controller passes DTO fields to service with new names.

- [ ] 6.2 Update UpdateBankAccountController — Swagger schema with new field names (`apps/api/src/modules/bank-accounts/presentation/update-bank-account.controller.ts`)
  - Files: `update-bank-account.controller.ts`
  - Acceptance: Same as create controller — Swagger updated, field names changed.

- [ ] 6.3 Update ListBankAccountsController — response uses enriched mapper (`apps/api/src/modules/bank-accounts/presentation/list-bank-accounts.controller.ts`)
  - Files: `list-bank-accounts.controller.ts`
  - Acceptance: `toResponse()` call updated to pass relation data. Swagger response schema shows nested objects.

- [ ] 6.4 Update BankAccountResponseSchema in Swagger schemas (`apps/api/src/shared/swagger/schemas.ts`)
  - Files: `schemas.ts`
  - Acceptance: Response schema shows `color: { id, name, hex }`, `accountType: { id, name }`, `currency: { id, code, name }` instead of flat strings.

## 7. Bank Accounts Module Wiring [api/module]

- [ ] 7.1 Update BankAccountsModule — remove stale imports, verify provider bindings (`apps/api/src/modules/bank-accounts/bank-accounts.module.ts`)
  - Files: `bank-accounts.module.ts`
  - Acceptance: No references to `BANK_ACCOUNT_TYPE`. All services/controllers compile. Module imports `ColorsModule` or uses schema directly (repository handles its own queries). Repository binding still works.

- [ ] 7.2 Update `drizzle.config.ts` if needed — ensure currencies schema glob is covered
  - Files: `apps/api/drizzle.config.ts`
  - Acceptance: Glob pattern `./src/modules/*/infra/drizzle/schemas/*` already covers `currencies`. Verify.

## 8. Type Check & Shared Domain [api/shared]

- [ ] 8.1 Update BankAccountCreatedEvent if it references `currency` string (`apps/api/src/shared/domain/events/`)
  - Files: find event file via grep
  - Acceptance: Event uses `currencyId` instead of `currency` if applicable. Or keeps `currency` for backward compatibility — document decision.

- [ ] 8.2 Run `turbo check-types --filter @fincheck/api` — fix all type errors
  - Files: multiple (any file with broken types)
  - Acceptance: Zero type errors in `@fincheck/api`.

## 9. Frontend — API Types & Client [web/api]

- [ ] 9.1 Update `Account` type and `CreateAccountRequest` type (`apps/web/src/pages/home/api/accounts.ts`)
  - Files: `accounts.ts`
  - Acceptance:
    - `Account.color` → `Account.color: { id: string; name: string; hex: string }`
    - `Account.type` → `Account.accountType: { id: string; name: string }`
    - `Account.currency` → `Account.currency: { id: string; code: string; name: string }`
    - `CreateAccountRequest.color` → `CreateAccountRequest.colorId: string`
    - `CreateAccountRequest.type` → `CreateAccountRequest.accountTypeId: string`
    - `CreateAccountRequest.currency` → `CreateAccountRequest.currencyId?: string`

- [ ] 9.2 Update `addAcountSchema` Zod schema (`apps/web/src/pages/home/model/add-account-schema.ts`)
  - Files: `add-account-schema.ts`
  - Acceptance: Field `color` renamed to `colorId` (validates `string.min(1)`). Field `type` renamed to `accountTypeId`. No hex validation.

## 10. Frontend — Form & Hooks [web/ui]

- [ ] 10.1 Update `AddAccountForm` component — send IDs in payload (`apps/web/src/pages/home/ui/add-accounts.tsx`)
  - Files: `add-accounts.tsx`
  - Acceptance:
    - Color Select: `value={color.id}` (was `value={color.hex}`)
    - Form field names: `colorId`, `accountTypeId` (matching updated schema)
    - `handleSubmit` maps: `colorId: data.colorId`, `accountTypeId: data.accountTypeId`
    - No changes to visual rendering (still shows color swatches, type names)

- [ ] 10.2 Update `useAddAccount` hook if payload mapping changed (`apps/web/src/pages/home/model/use-add-account.ts`)
  - Files: `use-add-account.ts`
  - Acceptance: Passes `colorId`, `accountTypeId` to `createAccount()`. Compiles with updated `CreateAccountRequest` type.

- [ ] 10.3 Update `useListAccounts` and any components consuming `Account` type
  - Files: any component using `account.color`, `account.type`, `account.currency`
  - Acceptance: References updated — e.g., `account.color.hex` instead of `account.color`, `account.accountType.name` instead of `account.type`. Find all usages with grep.

- [ ] 10.4 Run `turbo check-types --filter @fincheck/web` — fix all type errors
  - Files: multiple
  - Acceptance: Zero type errors in `@fincheck/web`.

## 11. End-to-End Verification [integration]

- [ ] 11.1 Start API and verify `GET /api/v1/currencies` returns seed data
  - Acceptance: 200 response with `[{ id: "BRL", code: "BRL", name: "Real Brasileiro" }, ...]`

- [ ] 11.2 Verify `POST /api/v1/bank-accounts` with `{ name: "Test", colorId: "indigo", accountTypeId: "checking", initialBalance: 0 }` creates account
  - Acceptance: 201 response. Account persisted with correct FK values.

- [ ] 11.3 Verify `GET /api/v1/bank-accounts` returns enriched response with nested objects
  - Acceptance: Each account has `color: { id, name, hex }`, `accountType: { id, name }`, `currency: { id, code, name }`.

- [ ] 11.4 Verify frontend add-account form works end-to-end
  - Acceptance: User can select color, type, enter name and amount, submit. Account appears in list with correct color rendering.

- [ ] 11.5 Verify `PUT /api/v1/bank-accounts/:id` with `{ colorId: "blue" }` updates correctly
  - Acceptance: Account color changes. Response reflects new color object.

- [ ] 11.6 Run `turbo check-types` across entire monorepo
  - Acceptance: Zero type errors in all packages.
