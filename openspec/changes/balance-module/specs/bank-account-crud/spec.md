## MODIFIED Requirements

### Requirement: User can create a bank account

The system SHALL allow an authenticated user to create a bank account by providing a name, type, initial balance, currency, color, and optional icon. The system SHALL generate a unique ID (UUIDv4) for the account and associate it with the authenticated user's ID extracted from the session. On successful creation, the system SHALL emit a `BankAccountCreatedEvent` domain event containing the account ID, user ID, initial balance, and currency. The `currentBalance` field is removed — balance tracking is handled by the balances module.

#### Scenario: Successful creation with all fields

- **WHEN** an authenticated user sends `POST /api/bank-accounts` with `{ name: "Nubank", type: "checking", initialBalance: 1500.50, currency: "BRL", color: "#7950F2", icon: "bank" }`
- **THEN** the system creates the bank account with a generated UUIDv4 ID, emits a `BankAccountCreatedEvent`, and returns HTTP 201 with the created account data (id, name, type, initialBalance, currency, color, icon, createdAt, updatedAt). The response SHALL NOT include `currentBalance`.

#### Scenario: Successful creation with defaults

- **WHEN** an authenticated user sends `POST /api/bank-accounts` with `{ name: "Carteira", type: "cash", color: "#12B886" }`
- **THEN** the system creates the account with `initialBalance: 0`, `currency: "BRL"`, `icon: null`, and emits a `BankAccountCreatedEvent`

#### Scenario: Validation failure — missing required fields

- **WHEN** an authenticated user sends `POST /api/bank-accounts` with `{ type: "checking" }` (missing name and color)
- **THEN** the system rejects the request with a validation error indicating the missing fields. No event SHALL be emitted.

#### Scenario: Validation failure — invalid account type

- **WHEN** an authenticated user sends `POST /api/bank-accounts` with `{ name: "Test", type: "invalid_type", color: "#000000" }`
- **THEN** the system rejects the request with a validation error indicating the type is invalid

#### Scenario: Validation failure — invalid color format

- **WHEN** an authenticated user sends `POST /api/bank-accounts` with `{ name: "Test", type: "checking", color: "red" }`
- **THEN** the system rejects the request with a validation error indicating the color must be a valid hex format (`#RRGGBB`)

#### Scenario: Unauthenticated request

- **WHEN** an unauthenticated user sends `POST /api/bank-accounts`
- **THEN** the system returns HTTP 401 Unauthorized

---

### Requirement: User can list their bank accounts

The system SHALL return all bank accounts belonging to the authenticated user. The system SHALL NOT return accounts belonging to other users. The response SHALL NOT include `currentBalance` — balance information is available via the balances endpoint.

#### Scenario: User has multiple accounts

- **WHEN** an authenticated user sends `GET /api/bank-accounts` and has 3 bank accounts
- **THEN** the system returns HTTP 200 with an array of 3 bank account objects, each containing id, name, type, initialBalance, currency, color, icon, createdAt, updatedAt. The response SHALL NOT include `currentBalance`.

#### Scenario: User has no accounts

- **WHEN** an authenticated user sends `GET /api/bank-accounts` and has 0 bank accounts
- **THEN** the system returns HTTP 200 with an empty array `[]`

#### Scenario: Data isolation between users

- **WHEN** User A sends `GET /api/bank-accounts` and User B has 5 accounts but User A has 2
- **THEN** the system returns only User A's 2 accounts, with no data from User B

---

### Requirement: Balance precision

The system SHALL store `initialBalance` with exactly 2 decimal places of precision using PostgreSQL `numeric(12,2)`. The maximum supported value SHALL be `9999999999.99`. The system SHALL accept negative balances (credit cards may have negative meaning debt). The `currentBalance` column is removed from the schema.

#### Scenario: Precise decimal storage

- **WHEN** a user creates an account with `initialBalance: 1500.50`
- **THEN** the system stores and returns `1500.50` (not `1500.5` or `1500.4999...`)

#### Scenario: Negative balance allowed

- **WHEN** a user creates a credit card account with `initialBalance: -3200.00`
- **THEN** the system creates the account with `initialBalance: -3200.00`

## REMOVED Requirements

### Requirement: currentBalance field on bank accounts

**Reason**: The `currentBalance` column on `bank_accounts` is redundant. Balance tracking is now handled by the dedicated `balances` module which stores per-account balances in cents and provides aggregated queries. The `initialBalance` field is preserved as a record of the starting balance.

**Migration**: Balance data is now available via `GET /api/balances`. The `currentBalance` column always equaled `initialBalance` (no transactions existed to change it), so no data is lost.
