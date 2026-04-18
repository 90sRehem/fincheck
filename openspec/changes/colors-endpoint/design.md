# Design: GET /api/colors endpoint

## Architecture

Minimal module — no DDD layers required. Static data served directly from a controller constant.

```
apps/api/src/modules/colors/
├── colors.module.ts           # NestJS module registration
└── presentation/
    └── list-colors.controller.ts  # GET /api/colors — returns static color list
```

## Reference Pattern

The design follows `ListAccountTypesController` exactly:

```
apps/api/src/modules/bank-accounts/presentation/list-account-types.controller.ts
```

That controller defines a `const` map and a single `@Get()` method that transforms it to `{ id, name }[]`. The colors endpoint replicates this pattern.

## Color Data

The 15 colors from the design system icon registry (`packages/design-system/src/components/ui/icons/colors.ts`):

| id       | name     |
|----------|----------|
| gray     | Gray     |
| green    | Green    |
| indigo   | Indigo   |
| red      | Red      |
| black    | Black    |
| lime     | Lime     |
| blue     | Blue     |
| pink     | Pink     |
| white    | White    |
| yellow   | Yellow   |
| cyan     | Cyan     |
| grape    | Grape    |
| orange   | Orange   |
| teal     | Teal     |
| purple   | Purple   |

## Color Constant Definition

Following the project convention (no TypeScript enums — use `as const` objects):

```typescript
const COLORS = [
  { id: "gray", name: "Gray" },
  { id: "green", name: "Green" },
  // ... all 15
] as const;
```

Since this is a list (not a lookup map like `BANK_ACCOUNT_TYPE`), a `const` array is more appropriate than an object with derived union type. There is no need for type-narrowing on individual color values from the backend perspective.

## Response Shape

```json
// GET /api/colors → 200
[
  { "id": "gray", "name": "Gray" },
  { "id": "green", "name": "Green" },
  { "id": "indigo", "name": "Indigo" },
  { "id": "red", "name": "Red" },
  { "id": "black", "name": "Black" },
  { "id": "lime", "name": "Lime" },
  { "id": "blue", "name": "Blue" },
  { "id": "pink", "name": "Pink" },
  { "id": "white", "name": "White" },
  { "id": "yellow", "name": "Yellow" },
  { "id": "cyan", "name": "Cyan" },
  { "id": "grape", "name": "Grape" },
  { "id": "orange", "name": "Orange" },
  { "id": "teal", "name": "Teal" },
  { "id": "purple", "name": "Purple" }
]
```

## Swagger Documentation

Add a `ColorResponseSchema` to `apps/api/src/shared/swagger/schemas.ts` for API docs consistency:

```typescript
export const ColorResponseSchema: SchemaObject = {
  type: "object",
  properties: {
    id: { type: "string", example: "indigo" },
    name: { type: "string", example: "Indigo" },
  },
};
```

## Module Registration

`ColorsModule` registered in `app.module.ts` alongside `BankAccountsModule`, `TransactionsModule`, `BalancesModule`.

## No Database Impact

- No Drizzle schema
- No migration
- No schema-registry changes
- No drizzle.config.ts changes

## Testing Considerations

- The controller is pure (no DI dependencies) — unit test can instantiate directly
- Verify response is exactly the 15-item array with correct `{ id, name }` shape
- Verify the `id` values match what the frontend expects (lowercase icon names)
