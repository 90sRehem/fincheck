# Design: Lookup Tables Persistence

## Architecture Overview

Two parallel tracks:
1. **New module** `modules/colors/` — full DDD for the colors lookup table
2. **Refactor** `modules/bank-accounts/` — add repository-backed account types

```
modules/
├── colors/                              # NEW MODULE
│   ├── colors.module.ts
│   ├── domain/
│   │   ├── entities/color.entity.ts
│   │   ├── repositories/color.repository.ts
│   │   ├── use-cases/list-colors.use-case.ts
│   │   └── index.ts
│   ├── application/
│   │   └── list-colors/
│   │       └── list-colors.service.ts
│   ├── presentation/
│   │   └── list-colors.controller.ts
│   └── infra/
│       ├── drizzle/schemas/color-schema.ts
│       ├── persistence/drizzle-color.repository.ts
│       └── mappers/color.mapper.ts
│
└── bank-accounts/                       # EXISTING — add account type support
    ├── domain/
    │   ├── entities/account-type.entity.ts        # NEW
    │   ├── repositories/account-type.repository.ts # NEW
    │   ├── use-cases/list-account-types.use-case.ts # NEW
    │   └── index.ts                                # EDIT — add exports
    ├── application/
    │   └── list-account-types/                     # NEW
    │       └── list-account-types.service.ts
    ├── presentation/
    │   └── list-account-types.controller.ts        # EDIT — inject service
    ├── infra/
    │   ├── drizzle/schemas/account-type-schema.ts  # NEW
    │   ├── persistence/drizzle-account-type.repository.ts # NEW
    │   └── mappers/account-type.mapper.ts          # NEW
    └── bank-accounts.module.ts                     # EDIT — register new providers
```

## Database Schemas

### `colors` table

```sql
CREATE TABLE colors (
  id   TEXT PRIMARY KEY,  -- e.g. "gray", "indigo"
  name TEXT NOT NULL,     -- e.g. "Gray", "Indigo"
  hex  TEXT NOT NULL      -- e.g. "#868E96", "#4C6EF5"
);
```

Drizzle definition (`color-schema.ts`):

```typescript
import { pgTable, text } from "drizzle-orm/pg-core";

export const colors = pgTable("colors", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  hex: text("hex").notNull(),
});
```

### `account_types` table

```sql
CREATE TABLE account_types (
  id   TEXT PRIMARY KEY,  -- e.g. "checking", "savings"
  name TEXT NOT NULL       -- e.g. "Checking", "Savings"
);
```

Drizzle definition (`account-type-schema.ts`):

```typescript
import { pgTable, text } from "drizzle-orm/pg-core";

export const accountTypes = pgTable("account_types", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
});
```

### No `createdAt`/`updatedAt` on lookup tables

These are system-defined constants, not user-mutable entities. Timestamps add no value and would complicate the seed script. The domain entities will NOT extend `Entity<T>` — they are simple value-holder classes.

## Seed Data

### Colors (15 entries)

Extracted from `packages/design-system/src/components/ui/icons/colors.tsx` — the `fill` attribute on the SVG `<path>` element:

| id     | name   | hex     |
|--------|--------|---------|
| gray   | Gray   | #868E96 |
| green  | Green  | #40C057 |
| indigo | Indigo | #4C6EF5 |
| red    | Red    | #FA5252 |
| black  | Black  | #000000 |
| lime   | Lime   | #82C91E |
| blue   | Blue   | #228BE6 |
| pink   | Pink   | #E64980 |
| white  | White  | #FFFFFF |
| yellow | Yellow | #FAB005 |
| cyan   | Cyan   | #15AABF |
| grape  | Grape  | #BE4BDB |
| orange | Orange | #FD7E14 |
| teal   | Teal   | #12B886 |
| purple | Purple | #7950F2 |

> **Note on Black/White:** The SVG `fill` for Black's path is `#fff` (white icon on black background) and White's path is also `#fff`. The `hex` value in the seed should represent the **color swatch itself**, not the icon path fill. Black = `#000000`, White = `#FFFFFF`.

### Account Types (5 entries)

From `bank-accounts/domain/value-objects/bank-account-type.ts`:

| id          | name        |
|-------------|-------------|
| checking    | Checking    |
| savings     | Savings     |
| credit_card | Credit Card |
| cash        | Cash        |
| investment  | Investment  |

## Seed Script

Location: `apps/api/src/core/database/seed.ts`

```typescript
import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { colors } from "../../modules/colors/infra/drizzle/schemas/color-schema";
import { accountTypes } from "../../modules/bank-accounts/infra/drizzle/schemas/account-type-schema";

const COLORS_DATA = [
  { id: "gray", name: "Gray", hex: "#868E96" },
  // ... all 15
];

const ACCOUNT_TYPES_DATA = [
  { id: "checking", name: "Checking" },
  // ... all 5
];

async function seed() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);

  await db.insert(colors).values(COLORS_DATA).onConflictDoNothing();
  await db.insert(accountTypes).values(ACCOUNT_TYPES_DATA).onConflictDoNothing();

  await pool.end();
  console.log("Seed completed.");
}

seed();
```

Execution: `tsx apps/api/src/core/database/seed.ts`
NPM script: `"db:seed": "tsx src/core/database/seed.ts"` in `apps/api/package.json`

## Domain Entities

### Color Entity

Simple data class — NOT extending `Entity<T>` (no timestamps, no aggregate behavior):

```typescript
export class Color {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly hex: string,
  ) {}
}
```

### AccountType Entity

Same pattern:

```typescript
export class AccountType {
  constructor(
    readonly id: string,
    readonly name: string,
  ) {}
}
```

## Repository Ports

### ColorRepository

```typescript
export abstract class ColorRepository {
  abstract findAll(): Promise<Color[]>;
}
```

### AccountTypeRepository

```typescript
export abstract class AccountTypeRepository {
  abstract findAll(): Promise<AccountType[]>;
}
```

Single method each — these are read-only lookup tables. CRUD methods added in a future change.

## Use Cases

### ListColorsUseCase

```typescript
export class ListColorsUseCase implements UseCase<void, Color[]> {
  constructor(private readonly colorRepository: ColorRepository) {}

  async execute(): Promise<Either<unknown, Color[]>> {
    const colors = await this.colorRepository.findAll();
    return success(colors);
  }
}
```

### ListAccountTypesUseCase

Same pattern with `AccountTypeRepository`.

## Services

Each service extends its use-case and adds `@Injectable()`:

```typescript
@Injectable()
export class ListColorsService extends ListColorsUseCase {
  constructor(colorRepository: ColorRepository) {
    super(colorRepository);
  }
}
```

## Controllers

### ListColorsController

```typescript
@ApiTags("Colors")
@ApiCookieAuth("better-auth.session_token")
@Controller("colors")
export class ListColorsController {
  constructor(private readonly listColorsService: ListColorsService) {}

  @Get()
  async list() {
    const result = await this.listColorsService.execute();
    // result is Either — extract right value
    if (result.isSuccess) return result.value;
  }
}
```

### ListAccountTypesController (refactored)

Replace static `ACCOUNT_TYPE_LABELS` map with injected `ListAccountTypesService`:

```typescript
@Controller("account_types")
export class ListAccountTypesController {
  constructor(private readonly listAccountTypesService: ListAccountTypesService) {}

  @Get()
  async list() {
    const result = await this.listAccountTypesService.execute();
    if (result.isSuccess) return result.value;
  }
}
```

## Mappers

### ColorMapper

```typescript
export class ColorMapper {
  static toDomain(raw: { id: string; name: string; hex: string }): Color {
    return new Color(raw.id, raw.name, raw.hex);
  }

  static toResponse(entity: Color) {
    return { id: entity.id, name: entity.name, hex: entity.hex };
  }
}
```

### AccountTypeMapper

```typescript
export class AccountTypeMapper {
  static toDomain(raw: { id: string; name: string }): AccountType {
    return new AccountType(raw.id, raw.name);
  }

  static toResponse(entity: AccountType) {
    return { id: entity.id, name: entity.name };
  }
}
```

## Schema Registry Updates

`core/database/drizzle/schema-registry.ts`:

```typescript
import * as colorSchema from "../../../modules/colors/infra/drizzle/schemas/color-schema";
import * as accountTypeSchema from "../../../modules/bank-accounts/infra/drizzle/schemas/account-type-schema";

export const schema = {
  ...authSchema,
  ...bankAccountSchema,
  ...balanceSchema,
  ...transactionSchema,
  ...colorSchema,        // NEW
  ...accountTypeSchema,  // NEW
} as const;
```

## Drizzle Config

No changes needed — the existing glob `./src/modules/*/infra/drizzle/schemas/*` already covers both `colors` and `bank-accounts` module schemas.

## Swagger Schemas

Add to `shared/swagger/schemas.ts`:

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

`AccountTypeResponseSchema` already exists — no changes needed.

## Module Registration

### ColorsModule

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

### BankAccountsModule (updated)

Add to existing providers:

```typescript
{
  provide: AccountTypeRepository,
  useClass: DrizzleAccountTypeRepository,
},
ListAccountTypesService,
```

### AppModule

Add `ColorsModule` to imports.

## Response Shapes

```json
// GET /api/colors → 200
[
  { "id": "gray", "name": "Gray", "hex": "#868E96" },
  { "id": "green", "name": "Green", "hex": "#40C057" },
  ...
]

// GET /api/account_types → 200
[
  { "id": "checking", "name": "Checking" },
  { "id": "savings", "name": "Savings" },
  ...
]
```

## Testing Considerations

- Unit tests for use-cases: mock repository, verify `findAll()` is called and result is returned
- Controller tests: verify DI wiring, response shape
- Seed script: test idempotency by running twice — second run should produce no duplicates
