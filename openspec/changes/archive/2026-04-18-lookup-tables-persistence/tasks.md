# Tasks: lookup-tables-persistence

## Phase 1 — Database Schemas

### Task 1 — Create `colors` Drizzle schema
**Status:** done ✓
**File:** `apps/api/src/modules/colors/infra/drizzle/schemas/color-schema.ts` (create)
**Action:** create
**Details:**
Create the Drizzle schema for the `colors` lookup table:
- `id: text("id").primaryKey()` — lowercase color name (e.g., `"gray"`)
- `name: text("name").notNull()` — display label (e.g., `"Gray"`)
- `hex: text("hex").notNull()` — hex color code (e.g., `"#868E96"`)
- No timestamps (system-defined constants, not user-mutable)
- Import `pgTable, text` from `drizzle-orm/pg-core`

**Acceptance:**
- `colors` table exported from schema file
- Schema compiles without errors
- No `createdAt`/`updatedAt` columns

---

### Task 2 — Create `account_types` Drizzle schema
**Status:** done ✓
**File:** `apps/api/src/modules/bank-accounts/infra/drizzle/schemas/account-type-schema.ts` (create)
**Action:** create
**Details:**
Create the Drizzle schema for the `account_types` lookup table:
- `id: text("id").primaryKey()` — type slug (e.g., `"checking"`)
- `name: text("name").notNull()` — display label (e.g., `"Checking"`)
- No timestamps
- Import `pgTable, text` from `drizzle-orm/pg-core`

**Acceptance:**
- `accountTypes` table exported from schema file
- Schema compiles without errors

---

### Task 3 — Register new schemas in schema-registry
**Status:** done ✓
**File:** `apps/api/src/core/database/drizzle/schema-registry.ts` (edit)
**Action:** edit
**Details:**
- Add import: `import * as colorSchema from "../../../modules/colors/infra/drizzle/schemas/color-schema";`
- Add import: `import * as accountTypeSchema from "../../../modules/bank-accounts/infra/drizzle/schemas/account-type-schema";`
- Spread both into the `schema` object: `...colorSchema`, `...accountTypeSchema`

**Acceptance:**
- Both schemas included in the registry
- `DrizzleDB` type now includes `colors` and `accountTypes` in `db.query.*`
- File compiles without errors

---

### Task 4 — Generate and run migration
**Status:** done ✓
**File:** `apps/api/src/core/database/drizzle/migrations/` (generated)
**Action:** run commands
**Details:**
- Run `bun run --filter @fincheck/api db:generate` to generate the migration
- Verify the generated SQL creates `colors` and `account_types` tables
- Run `bun run --filter @fincheck/api db:migrate` to apply

**Acceptance:**
- Migration file generated with correct DDL
- Both tables exist in PostgreSQL after migration
- No existing tables or data affected

---

## Phase 2 — Colors Module (full DDD)

### Task 5 — Create Color entity
**Status:** done ✓
**File:** `apps/api/src/modules/colors/domain/entities/color.entity.ts` (create)
**Action:** create
**Details:**
Simple readonly data class (NOT extending `Entity<T>` — no timestamps, no aggregate behavior):
```typescript
export class Color {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly hex: string,
  ) {}
}
```

**Acceptance:**
- Class exported
- Has `id`, `name`, `hex` readonly properties
- Does NOT extend Entity or AggregateRoot

---

### Task 6 — Create ColorRepository abstract class (port)
**Status:** done ✓
**File:** `apps/api/src/modules/colors/domain/repositories/color.repository.ts` (create)
**Action:** create
**Details:**
Abstract class defining the repository contract:
```typescript
import { Color } from "../entities/color.entity";

export abstract class ColorRepository {
  abstract findAll(): Promise<Color[]>;
}
```

**Acceptance:**
- Abstract class with single `findAll()` method
- Returns `Promise<Color[]>`

---

### Task 7 — Create ListColorsUseCase
**Status:** done ✓
**File:** `apps/api/src/modules/colors/domain/use-cases/list-colors.use-case.ts` (create)
**Action:** create
**Details:**
Pure domain use-case (no `@Injectable`):
- Implements `UseCase<void, Color[]>` from `@/shared/domain/types/use-case`
- Constructor receives `ColorRepository`
- `execute()` calls `this.colorRepository.findAll()` and wraps in `success()`
- Import `Either, success` from `@/shared/domain/types/either`

**Acceptance:**
- Pure class, no NestJS decorators
- Returns `Either<unknown, Color[]>`
- Delegates to repository

---

### Task 8 — Create colors domain barrel export
**Status:** done ✓
**File:** `apps/api/src/modules/colors/domain/index.ts` (create)
**Action:** create
**Details:**
Barrel file exporting:
- `Color` from `./entities/color.entity`
- `ColorRepository` from `./repositories/color.repository`
- `ListColorsUseCase` from `./use-cases/list-colors.use-case`

**Acceptance:**
- All domain types accessible via `from "../domain"` or `from "../../domain"`

---

### Task 9 — Create ListColorsService
**Status:** done ✓
**File:** `apps/api/src/modules/colors/application/list-colors/list-colors.service.ts` (create)
**Action:** create
**Details:**
`@Injectable()` service that extends `ListColorsUseCase`:
- Constructor receives `ColorRepository` and passes to `super()`
- No additional orchestration needed

**Acceptance:**
- Has `@Injectable()` decorator
- Extends `ListColorsUseCase`
- Constructor passes `colorRepository` to `super()`

---

### Task 10 — Create ColorMapper
**Status:** done ✓
**File:** `apps/api/src/modules/colors/infra/mappers/color.mapper.ts` (create)
**Action:** create
**Details:**
Static mapper class (follow `BankAccountMapper` pattern with `biome-ignore lint/complexity/noStaticOnlyClass`):
- `toDomain(raw: { id: string; name: string; hex: string }): Color` — creates `new Color(raw.id, raw.name, raw.hex)`
- `toResponse(entity: Color)` — returns `{ id: entity.id, name: entity.name, hex: entity.hex }`

**Acceptance:**
- Both static methods work correctly
- `toDomain` creates Color instance
- `toResponse` returns plain object

---

### Task 11 — Create DrizzleColorRepository (adapter)
**Status:** done ✓
**File:** `apps/api/src/modules/colors/infra/persistence/drizzle-color.repository.ts` (create)
**Action:** create
**Details:**
`@Injectable()` class extending `ColorRepository`:
- Inject `@Inject(DRIZZLE_DB) private readonly db: DrizzleDB`
- `findAll()`: `await this.db.select().from(colors)` then map via `ColorMapper.toDomain`
- Import `colors` from schema, `DRIZZLE_DB` from constants, `DrizzleDB` from connection

**Acceptance:**
- Extends `ColorRepository`
- Uses Drizzle to query `colors` table
- Maps raw results to `Color` domain entities

---

### Task 12 — Create ListColorsController
**Status:** done ✓
**File:** `apps/api/src/modules/colors/presentation/list-colors.controller.ts` (create)
**Action:** create
**Details:**
- `@Controller("colors")` route prefix
- `@ApiTags("Colors")` + `@ApiCookieAuth("better-auth.session_token")`
- Inject `ListColorsService` via constructor
- `@Get()` method `list()`:
  - Calls `this.listColorsService.execute()`
  - Extracts success value, maps through `ColorMapper.toResponse`
  - Returns the array
- `@ApiOperation` with summary "List Colors"
- `@ApiResponse` 200 with schema `{ type: "array", items: ColorResponseSchema }`
- `@ApiResponse` 401 with `UnauthorizedErrorSchema`

**Acceptance:**
- `GET /api/colors` returns `{ id, name, hex }[]`
- Swagger docs render correctly
- Auth enforced (no `@AllowAnonymous()`)

---

### Task 13 — Create ColorsModule
**Status:** done ✓
**File:** `apps/api/src/modules/colors/colors.module.ts` (create)
**Action:** create
**Details:**
```typescript
@Module({
  controllers: [ListColorsController],
  providers: [
    { provide: ColorRepository, useClass: DrizzleColorRepository },
    ListColorsService,
  ],
})
export class ColorsModule {}
```

**Acceptance:**
- Controller registered
- Repository port bound to Drizzle adapter
- Service registered as provider

---

## Phase 3 — Account Types Refactor (bank-accounts module)

### Task 14 — Create AccountType entity
**Status:** done ✓
**File:** `apps/api/src/modules/bank-accounts/domain/entities/account-type.entity.ts` (create)
**Action:** create
**Details:**
Simple readonly data class (same pattern as Color entity):
```typescript
export class AccountType {
  constructor(
    readonly id: string,
    readonly name: string,
  ) {}
}
```

**Acceptance:**
- Class exported with `id` and `name` readonly properties
- Does NOT extend Entity or AggregateRoot

---

### Task 15 — Create AccountTypeRepository abstract class (port)
**Status:** done ✓
**File:** `apps/api/src/modules/bank-accounts/domain/repositories/account-type.repository.ts` (create)
**Action:** create
**Details:**
```typescript
import { AccountType } from "../entities/account-type.entity";

export abstract class AccountTypeRepository {
  abstract findAll(): Promise<AccountType[]>;
}
```

**Acceptance:**
- Abstract class with `findAll()` returning `Promise<AccountType[]>`

---

### Task 16 — Create ListAccountTypesUseCase
**Status:** done ✓
**File:** `apps/api/src/modules/bank-accounts/domain/use-cases/list-account-types.use-case.ts` (create)
**Action:** create
**Details:**
Pure domain use-case (no `@Injectable`):
- Implements `UseCase<void, AccountType[]>`
- Constructor receives `AccountTypeRepository`
- `execute()` calls `this.accountTypeRepository.findAll()` and wraps in `success()`

**Acceptance:**
- Pure class, no NestJS decorators
- Returns `Either<unknown, AccountType[]>`

---

### Task 17 — Update bank-accounts domain barrel export
**Status:** done ✓
**File:** `apps/api/src/modules/bank-accounts/domain/index.ts` (edit)
**Action:** edit
**Details:**
Add exports for:
- `AccountType` from `./entities/account-type.entity`
- `AccountTypeRepository` from `./repositories/account-type.repository`
- `ListAccountTypesUseCase` from `./use-cases/list-account-types.use-case`

**Acceptance:**
- All new types accessible via barrel import
- Existing exports unchanged

---

### Task 18 — Create ListAccountTypesService
**Status:** done ✓
**File:** `apps/api/src/modules/bank-accounts/application/list-account-types/list-account-types.service.ts` (create)
**Action:** create
**Details:**
`@Injectable()` service extending `ListAccountTypesUseCase`:
- Constructor receives `AccountTypeRepository` and passes to `super()`

**Acceptance:**
- Has `@Injectable()` decorator
- Extends `ListAccountTypesUseCase`

---

### Task 19 — Create AccountTypeMapper
**Status:** done ✓
**File:** `apps/api/src/modules/bank-accounts/infra/mappers/account-type.mapper.ts` (create)
**Action:** create
**Details:**
Static mapper class:
- `toDomain(raw: { id: string; name: string }): AccountType`
- `toResponse(entity: AccountType)` — returns `{ id: entity.id, name: entity.name }`

**Acceptance:**
- Both static methods work correctly

---

### Task 20 — Create DrizzleAccountTypeRepository (adapter)
**Status:** done ✓
**File:** `apps/api/src/modules/bank-accounts/infra/persistence/drizzle-account-type.repository.ts` (create)
**Action:** create
**Details:**
`@Injectable()` class extending `AccountTypeRepository`:
- Inject `@Inject(DRIZZLE_DB) private readonly db: DrizzleDB`
- `findAll()`: query `accountTypes` table, map via `AccountTypeMapper.toDomain`

**Acceptance:**
- Extends `AccountTypeRepository`
- Uses Drizzle to query `account_types` table

---

### Task 21 — Refactor ListAccountTypesController to use service
**Status:** done ✓
**File:** `apps/api/src/modules/bank-accounts/presentation/list-account-types.controller.ts` (edit)
**Action:** edit
**Details:**
Replace the static `ACCOUNT_TYPE_LABELS` map and direct return with:
- Inject `ListAccountTypesService` via constructor
- `list()` method calls `this.listAccountTypesService.execute()`
- Extract success value, map through `AccountTypeMapper.toResponse`
- Remove `ACCOUNT_TYPE_LABELS` constant
- Remove import of `BANK_ACCOUNT_TYPE` and `BankAccountType` from domain (no longer needed)
- Add import of `ListAccountTypesService` and `AccountTypeMapper`

**Acceptance:**
- Controller no longer has static data
- Data comes from database via service → use-case → repository
- Response shape unchanged: `{ id: string; name: string }[]`
- Swagger decorators preserved

---

### Task 22 — Update BankAccountsModule with account type providers
**Status:** done ✓
**File:** `apps/api/src/modules/bank-accounts/bank-accounts.module.ts` (edit)
**Action:** edit
**Details:**
Add to providers:
- `{ provide: AccountTypeRepository, useClass: DrizzleAccountTypeRepository }`
- `ListAccountTypesService`

Add imports for:
- `AccountTypeRepository` from `./domain`
- `DrizzleAccountTypeRepository` from `./infra/persistence/drizzle-account-type.repository`
- `ListAccountTypesService` from `./application/list-account-types/list-account-types.service`

**Acceptance:**
- Module compiles without errors
- `ListAccountTypesController` receives injected service
- Existing bank-account providers unaffected

---

## Phase 4 — Seed, Swagger & Registration

### Task 23 — Add ColorResponseSchema to Swagger schemas
**Status:** done ✓
**File:** `apps/api/src/shared/swagger/schemas.ts` (edit)
**Action:** edit (append)
**Details:**
Add a `ColorResponseSchema` constant:
```typescript
export const ColorResponseSchema: SchemaObject = {
  type: "object",
  properties: {
    id: { type: "string", example: "indigo" },
    name: { type: "string", example: "Indigo" },
    hex: { type: "string", example: "#4C6EF5" },
  },
};
```

**Acceptance:**
- `ColorResponseSchema` exported
- Includes `hex` field
- Shape matches `{ id: string; name: string; hex: string }`

---

### Task 24 — Register ColorsModule in AppModule
**Status:** done ✓
**File:** `apps/api/src/app.module.ts` (edit)
**Action:** edit
**Details:**
- Add import: `import { ColorsModule } from "./modules/colors/colors.module";`
- Add `ColorsModule` to the `imports` array (after `BalancesModule`)

**Acceptance:**
- `ColorsModule` listed in `AppModule` imports
- All modules still compile

---

### Task 25 — Create seed script
**Status:** done ✓
**File:** `apps/api/src/core/database/seed.ts` (create)
**Action:** create
**Details:**
Create seed script that:
- Loads `dotenv/config`
- Creates a Drizzle connection directly (not via NestJS DI)
- Inserts 15 colors into `colors` table using `onConflictDoNothing()`
- Inserts 5 account types into `account_types` table using `onConflictDoNothing()`
- Closes pool connection
- Logs success message
- Color data (id → name → hex):
  - gray → Gray → #868E96
  - green → Green → #40C057
  - indigo → Indigo → #4C6EF5
  - red → Red → #FA5252
  - black → Black → #000000
  - lime → Lime → #82C91E
  - blue → Blue → #228BE6
  - pink → Pink → #E64980
  - white → White → #FFFFFF
  - yellow → Yellow → #FAB005
  - cyan → Cyan → #15AABF
  - grape → Grape → #BE4BDB
  - orange → Orange → #FD7E14
  - teal → Teal → #12B886
  - purple → Purple → #7950F2
- Account types data (id → name):
  - checking → Checking
  - savings → Savings
  - credit_card → Credit Card
  - cash → Cash
  - investment → Investment

**Acceptance:**
- Script runs without errors: `tsx apps/api/src/core/database/seed.ts`
- Running twice produces no duplicates (idempotent)
- All 15 colors and 5 account types in database after run

---

### Task 26 — Add `db:seed` npm script
**Status:** done ✓
**File:** `apps/api/package.json` (edit)
**Action:** edit
**Details:**
Add to scripts section:
```json
"db:seed": "tsx src/core/database/seed.ts"
```
Place after `db:studio`.

**Acceptance:**
- `bun run --filter @fincheck/api db:seed` executes the seed script
- Script exits cleanly

---

## Phase 5 — Verification

### Task 27 — Type check
**Status:** done ✓
**File:** n/a
**Action:** run command
**Details:**
Run `turbo check-types --filter @fincheck/api` to verify all new code compiles.

**Acceptance:**
- No type errors
- All new files resolve correctly

---

### Task 28 — End-to-end verification (manual)
**Status:** done ✓
**File:** n/a
**Action:** verify
**Details:**
1. Run migration: `bun run --filter @fincheck/api db:generate && bun run --filter @fincheck/api db:migrate`
2. Run seed: `bun run --filter @fincheck/api db:seed`
3. Start API: `bun run --filter @fincheck/api dev`
4. Verify `GET /api/colors` with valid auth returns 15 colors with `{ id, name, hex }`
5. Verify `GET /api/account_types` with valid auth returns 5 account types with `{ id, name }`
6. Verify both return 401 without auth
7. Verify Swagger docs at `/api/docs` show Colors and Bank Accounts tags
8. Run seed a second time to verify idempotency

**Acceptance:**
- 200 responses with correct data
- 401 for unauthenticated requests
- Swagger documentation renders both endpoints
- Second seed run produces no errors or duplicates
