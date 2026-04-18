## ADDED Requirements

### Requirement: Bank accounts schema uses FK relations
The `bank_accounts` Drizzle schema SHALL replace columns `color` (text), `type` (pgEnum), and `currency` (text) with: `color_id` (text, FK → colors.id, NOT NULL), `account_type_id` (text, FK → account_types.id, NOT NULL), `currency_id` (text, FK → currencies.id, NOT NULL, default "BRL"). The pgEnum `bank_account_type` SHALL be removed.

#### Scenario: Schema defines FK constraints
- **WHEN** the Drizzle schema is inspected
- **THEN** `bankAccounts` table has `colorId`, `accountTypeId`, `currencyId` columns with `.references()` to their respective lookup tables

#### Scenario: pgEnum is removed
- **WHEN** the migration runs
- **THEN** the PostgreSQL type `bank_account_type` no longer exists in the database

### Requirement: Bank accounts Drizzle relations include lookups
The `bankAccountsRelations` SHALL define `one()` relations to `colors`, `accountTypes`, and `currencies` tables, enabling `db.query.bankAccounts.findMany({ with: { color: true, accountType: true, currency: true } })`.

#### Scenario: Relational query returns nested objects
- **WHEN** `db.query.bankAccounts.findMany({ with: { color: true, accountType: true, currency: true } })` is executed
- **THEN** each result includes `color: { id, name, hex }`, `accountType: { id, name }`, and `currency: { id, code, name }`

### Requirement: Data migration preserves existing records
The migration SHALL convert existing `bank_accounts` data: `color` (hex) → `color_id` via lookup in `colors` table by hex, `type` (enum value) → `account_type_id` (same value), `currency` (text) → `currency_id` (same value, must exist in `currencies`). Records with unmatched hex values SHALL use `"gray"` as fallback. Records with unmatched currency SHALL use `"BRL"`.

#### Scenario: Hex color is matched to color_id
- **WHEN** a bank_account has `color = "#40C057"`
- **THEN** after migration, `color_id = "green"` (matching colors row where hex = "#40C057")

#### Scenario: Type enum value maps to account_type_id
- **WHEN** a bank_account has `type = "checking"`
- **THEN** after migration, `account_type_id = "checking"`

#### Scenario: Currency text maps to currency_id
- **WHEN** a bank_account has `currency = "BRL"`
- **THEN** after migration, `currency_id = "BRL"`

#### Scenario: Unknown hex falls back to gray
- **WHEN** a bank_account has `color = "#999999"` (not in colors table)
- **THEN** after migration, `color_id = "gray"`

### Requirement: BankAccount entity uses lookup IDs
The `BankAccount` entity props SHALL change: `color: string` → `colorId: string`, `type: BankAccountType` → `accountTypeId: string`, `currency: string` → `currencyId: string`. Getters SHALL reflect these new names.

#### Scenario: Entity exposes new property names
- **WHEN** a `BankAccount` entity is instantiated
- **THEN** `entity.colorId`, `entity.accountTypeId`, and `entity.currencyId` are accessible

### Requirement: BankAccount validator accepts IDs
The `BankAccountValidator` SHALL validate `colorId` as non-empty string, `accountTypeId` as non-empty string, and `currencyId` as non-empty string. It SHALL NOT validate hex format or enum values.

#### Scenario: Valid IDs pass validation
- **WHEN** a BankAccount is created with `colorId: "indigo"`, `accountTypeId: "checking"`, `currencyId: "BRL"`
- **THEN** validation succeeds

#### Scenario: Empty colorId fails validation
- **WHEN** a BankAccount is created with `colorId: ""`
- **THEN** validation fails with appropriate error message

### Requirement: Create bank account accepts IDs
The `POST /api/v1/bank-accounts` endpoint SHALL accept `colorId`, `accountTypeId`, and optionally `currencyId` (default "BRL") instead of `color` (hex), `type` (enum), and `currency` (text).

#### Scenario: Create with valid lookup IDs
- **WHEN** a user sends `POST /bank-accounts` with `{ name: "Nubank", colorId: "purple", accountTypeId: "checking", initialBalance: 0 }`
- **THEN** a bank account is created with `color_id = "purple"`, `account_type_id = "checking"`, `currency_id = "BRL"`

#### Scenario: Create with invalid colorId
- **WHEN** a user sends `POST /bank-accounts` with `{ colorId: "" }`
- **THEN** the response is 400 with validation error

### Requirement: Update bank account accepts IDs
The `PUT /api/v1/bank-accounts/:id` endpoint SHALL accept optional `colorId`, `accountTypeId`, `currencyId` instead of `color`, `type`, `currency`.

#### Scenario: Update color by ID
- **WHEN** a user sends `PUT /bank-accounts/:id` with `{ colorId: "blue" }`
- **THEN** the bank account's `color_id` is updated to `"blue"`

### Requirement: List bank accounts returns enriched response
The `GET /api/v1/bank-accounts` response SHALL include nested objects for relations:
```json
{
  "id": "...",
  "name": "Nubank",
  "color": { "id": "purple", "name": "Purple", "hex": "#7950F2" },
  "accountType": { "id": "checking", "name": "Checking" },
  "currency": { "id": "BRL", "code": "BRL", "name": "Real Brasileiro" },
  "initialBalance": 1500.00,
  "icon": null,
  "createdAt": "...",
  "updatedAt": "..."
}
```

#### Scenario: List returns nested color object
- **WHEN** a user lists their bank accounts
- **THEN** each account includes `color: { id, name, hex }` instead of `color: "#hex"`

#### Scenario: List returns nested accountType object
- **WHEN** a user lists their bank accounts
- **THEN** each account includes `accountType: { id, name }` instead of `type: "checking"`

#### Scenario: List returns nested currency object
- **WHEN** a user lists their bank accounts
- **THEN** each account includes `currency: { id, code, name }` instead of `currency: "BRL"`

### Requirement: BankAccount mapper handles relations
The `BankAccountMapper` SHALL have updated methods:
- `toDomain()` — accepts raw data with relation objects, maps to entity with IDs
- `toPersistence()` — maps entity IDs to column values
- `toResponse()` — maps entity + relation data to enriched response shape

#### Scenario: Mapper converts relational query result to domain
- **WHEN** `toDomain()` receives a Drizzle relational query result with nested `color`, `accountType`, `currency`
- **THEN** it creates a `BankAccount` entity with `colorId`, `accountTypeId`, `currencyId`

#### Scenario: Mapper produces enriched response
- **WHEN** `toResponse()` is called with an entity and its relation data
- **THEN** it returns the nested object shape defined in the response requirement

### Requirement: Frontend sends lookup IDs
The frontend `createAccount()` and `updateAccount()` functions SHALL send `colorId`, `accountTypeId`, `currencyId` instead of `color` (hex), `type` (string), `currency` (string).

#### Scenario: Add account form sends colorId
- **WHEN** a user selects color "Purple" and submits the form
- **THEN** the request body includes `colorId: "purple"` (not `color: "#7950F2"`)

#### Scenario: Add account form sends accountTypeId
- **WHEN** a user selects type "Checking" and submits
- **THEN** the request body includes `accountTypeId: "checking"`

### Requirement: Frontend Account type uses nested objects
The frontend `Account` type SHALL reflect the enriched response: `color: { id: string, name: string, hex: string }`, `accountType: { id: string, name: string }`, `currency: { id: string, code: string, name: string }`.

#### Scenario: Account list renders with nested color data
- **WHEN** the account list component receives the API response
- **THEN** it can access `account.color.hex` for rendering the color indicator

#### Scenario: Account list renders with nested type data
- **WHEN** the account list renders
- **THEN** it can access `account.accountType.name` for display
