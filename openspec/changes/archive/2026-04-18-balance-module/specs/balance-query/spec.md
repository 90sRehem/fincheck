## ADDED Requirements

### Requirement: User can query aggregated balances by currency

The system SHALL provide an endpoint `GET /api/balances` that returns the authenticated user's total balance aggregated by currency. The response SHALL be an array of `{ amountCents, currency }` objects, one per distinct currency across all the user's bank accounts. The `amountCents` value SHALL be the sum of all balance rows for that currency. Aggregation SHALL be performed in the domain use-case (in-memory), not via SQL `GROUP BY`. Authentication SHALL use the session (not URL parameters).

#### Scenario: User has accounts in single currency

- **WHEN** an authenticated user sends `GET /api/balances` and has 3 BRL accounts with balances 150000, 50000, and 25000 cents
- **THEN** the system returns HTTP 200 with `[{ "amountCents": 225000, "currency": "BRL" }]`

#### Scenario: User has accounts in multiple currencies

- **WHEN** an authenticated user sends `GET /api/balances` and has 2 BRL accounts (150000 + 50000 cents) and 1 USD account (10000 cents)
- **THEN** the system returns HTTP 200 with `[{ "amountCents": 200000, "currency": "BRL" }, { "amountCents": 10000, "currency": "USD" }]`

#### Scenario: User has no accounts

- **WHEN** an authenticated user sends `GET /api/balances` and has 0 bank accounts
- **THEN** the system returns HTTP 200 with an empty array `[]`

#### Scenario: Data isolation between users

- **WHEN** User A sends `GET /api/balances` and User B has accounts with large balances
- **THEN** the system returns only User A's aggregated balances, with no data from User B

#### Scenario: Unauthenticated request

- **WHEN** an unauthenticated user sends `GET /api/balances`
- **THEN** the system returns HTTP 401 Unauthorized

---

### Requirement: Balance row created on bank account creation

The system SHALL automatically create a balance row when a new bank account is created. The balance row SHALL have `amountCents` set to the bank account's `initialBalance` converted to cents (multiplied by 100), the same `currency` as the bank account, and be associated with both the user and the bank account. This SHALL happen via a domain event (`BankAccountCreatedEvent`) — the balances module listens for the event and creates the row.

#### Scenario: Account created with positive initial balance

- **WHEN** a user creates a bank account with `initialBalance: 1500.50` and `currency: "BRL"`
- **THEN** the system creates a balance row with `amountCents: 150050`, `currency: "BRL"`, linked to the new bank account

#### Scenario: Account created with zero balance

- **WHEN** a user creates a bank account with `initialBalance: 0` (default)
- **THEN** the system creates a balance row with `amountCents: 0`, linked to the new bank account

#### Scenario: Account created with negative balance

- **WHEN** a user creates a credit card account with `initialBalance: -3200.00`
- **THEN** the system creates a balance row with `amountCents: -320000`, linked to the new bank account

---

### Requirement: Balance uses integer cents storage

The system SHALL store balance amounts as integer cents (`bigint`) in the `balances` table. This avoids floating-point precision issues. The conversion from the bank account's decimal `initialBalance` to cents SHALL multiply by 100 and round to the nearest integer.

#### Scenario: Precise conversion from decimal to cents

- **WHEN** a bank account is created with `initialBalance: 1500.50`
- **THEN** the balance row stores `amountCents: 150050` (not 150050.0 or 1500.50)

#### Scenario: Aggregation is exact

- **WHEN** three balance rows exist with `amountCents` values 100, 200, and 300 for the same currency
- **THEN** the aggregated total is exactly `600` (integer arithmetic in the use-case `reduce()`, no floating-point drift)
