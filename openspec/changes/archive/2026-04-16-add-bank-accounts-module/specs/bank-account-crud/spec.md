## ADDED Requirements

### Requirement: User can create a bank account

The system SHALL allow an authenticated user to create a bank account by providing a name, type, initial balance, currency, color, and optional icon. The system SHALL generate a unique ID (UUIDv4) for the account and set `currentBalance` equal to `initialBalance` at creation time. The account SHALL be associated with the authenticated user's ID extracted from the session.

#### Scenario: Successful creation with all fields

- **WHEN** an authenticated user sends `POST /api/bank-accounts` with `{ name: "Nubank", type: "checking", initialBalance: 1500.50, currency: "BRL", color: "#7950F2", icon: "bank" }`
- **THEN** the system creates the bank account with a generated UUIDv4 ID, sets `currentBalance` to `1500.50`, and returns HTTP 201 with the created account data (id, name, type, initialBalance, currentBalance, currency, color, icon, createdAt, updatedAt)

#### Scenario: Successful creation with defaults

- **WHEN** an authenticated user sends `POST /api/bank-accounts` with `{ name: "Carteira", type: "cash", color: "#12B886" }`
- **THEN** the system creates the account with `initialBalance: 0`, `currency: "BRL"`, `icon: null`, and `currentBalance: 0`

#### Scenario: Validation failure — missing required fields

- **WHEN** an authenticated user sends `POST /api/bank-accounts` with `{ type: "checking" }` (missing name and color)
- **THEN** the system rejects the request with a validation error indicating the missing fields

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

The system SHALL return all bank accounts belonging to the authenticated user. The system SHALL NOT return accounts belonging to other users.

#### Scenario: User has multiple accounts

- **WHEN** an authenticated user sends `GET /api/bank-accounts` and has 3 bank accounts
- **THEN** the system returns HTTP 200 with an array of 3 bank account objects, each containing id, name, type, initialBalance, currentBalance, currency, color, icon, createdAt, updatedAt

#### Scenario: User has no accounts

- **WHEN** an authenticated user sends `GET /api/bank-accounts` and has 0 bank accounts
- **THEN** the system returns HTTP 200 with an empty array `[]`

#### Scenario: Data isolation between users

- **WHEN** User A sends `GET /api/bank-accounts` and User B has 5 accounts but User A has 2
- **THEN** the system returns only User A's 2 accounts, with no data from User B

---

### Requirement: User can update a bank account

The system SHALL allow an authenticated user to update one or more fields of their own bank account. The system SHALL reject updates to accounts that do not belong to the authenticated user. Only provided fields SHALL be updated; omitted fields SHALL retain their current values.

#### Scenario: Update single field

- **WHEN** an authenticated user sends `PUT /api/bank-accounts/:id` with `{ name: "Nubank Conta" }`
- **THEN** the system updates only the name, preserves all other fields, bumps `updatedAt`, and returns HTTP 200 with the full updated account

#### Scenario: Update multiple fields

- **WHEN** an authenticated user sends `PUT /api/bank-accounts/:id` with `{ name: "Itau", type: "savings", color: "#FF6B6B" }`
- **THEN** the system updates all three fields, preserves the rest, and returns HTTP 200

#### Scenario: Account not found

- **WHEN** an authenticated user sends `PUT /api/bank-accounts/:id` with a non-existent ID
- **THEN** the system returns HTTP 404 Not Found

#### Scenario: Account belongs to another user

- **WHEN** User A sends `PUT /api/bank-accounts/:id` where `:id` belongs to User B
- **THEN** the system returns HTTP 404 Not Found (not 403, to avoid leaking existence)

#### Scenario: Validation failure on update

- **WHEN** an authenticated user sends `PUT /api/bank-accounts/:id` with `{ color: "not-a-hex" }`
- **THEN** the system rejects the request with a validation error

---

### Requirement: User can delete a bank account

The system SHALL allow an authenticated user to permanently delete their own bank account. The system SHALL reject deletion of accounts that do not belong to the authenticated user.

#### Scenario: Successful deletion

- **WHEN** an authenticated user sends `DELETE /api/bank-accounts/:id` for their own account
- **THEN** the system deletes the account and returns HTTP 204 No Content

#### Scenario: Account not found

- **WHEN** an authenticated user sends `DELETE /api/bank-accounts/:id` with a non-existent ID
- **THEN** the system returns HTTP 404 Not Found

#### Scenario: Account belongs to another user

- **WHEN** User A sends `DELETE /api/bank-accounts/:id` where `:id` belongs to User B
- **THEN** the system returns HTTP 404 Not Found

---

### Requirement: Bank account type validation

The system SHALL accept only the following bank account types: `checking`, `savings`, `credit_card`, `cash`, `investment`. These types SHALL be enforced at both the application layer (Zod validation) and the database layer (PostgreSQL pgEnum).

#### Scenario: All valid types accepted

- **WHEN** a user creates accounts with types `checking`, `savings`, `credit_card`, `cash`, `investment`
- **THEN** the system creates all accounts successfully

#### Scenario: Invalid type rejected

- **WHEN** a user creates an account with type `debit` or any value not in the valid set
- **THEN** the system rejects the request with a validation error

---

### Requirement: Balance precision

The system SHALL store `initialBalance` and `currentBalance` with exactly 2 decimal places of precision using PostgreSQL `numeric(12,2)`. The maximum supported value SHALL be `9999999999.99`. The system SHALL accept negative balances (credit cards may have negative meaning debt).

#### Scenario: Precise decimal storage

- **WHEN** a user creates an account with `initialBalance: 1500.50`
- **THEN** the system stores and returns `1500.50` (not `1500.5` or `1500.4999...`)

#### Scenario: Negative balance allowed

- **WHEN** a user creates a credit card account with `initialBalance: -3200.00`
- **THEN** the system creates the account with `initialBalance: -3200.00` and `currentBalance: -3200.00`
