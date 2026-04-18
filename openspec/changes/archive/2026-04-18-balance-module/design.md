## Context

The backend has a working `bank-accounts` module with full CRUD, a DDD kernel (Entity, AggregateRoot, ValueObject, Either, DomainEvent, DomainEventDispatcher), and an events infrastructure (`EventsModule` with `NestJsEventDispatcher` wrapping `EventEmitter2`). However, no module currently uses domain events — the event infrastructure is wired but idle.

The frontend already has a `balance` entity slice (`apps/web/src/entities/balance/`) calling `GET /api/balances/:userId` and expecting `{ amountCents, currency }[]`. The backend has no such endpoint. The `bank_accounts` table has a `currentBalance` column that is always equal to `initialBalance` — it serves no purpose without a transaction system.

The frontend `accounts.ts` also calls `api/accounts?userId=...` instead of the correct `api/bank-accounts` endpoint.

## Goals / Non-Goals

**Goals:**

- Create a `balances` module that provides `GET /api/balances` returning aggregated balances per currency
- Establish the event-driven pattern: AggregateRoot emits event → Application Service dispatches → Listener in another module reacts
- Remove the redundant `currentBalance` column from `bank_accounts`
- Fix the frontend API mismatch in `accounts.ts`

**Non-Goals:**

- Balance updates from transactions (future — Transaction module)
- Balance deletion/update on account deletion (future)
- Multi-currency conversion or exchange rates
- Frontend balance display changes (already implemented, just needs working backend)
- Pagination on balance endpoint (users have few accounts)

## Decisions

### 1. Dedicated `balances` table with use-case aggregation

**Choice:** A `balances` table with one row per bank account. The repository returns raw rows via `findAllByUserId(userId)`. The `GetUserBalancesUseCase` aggregates by currency in-memory using a `reduce()`.

**Rationale:** This separates the balance concern from bank accounts. Aggregation logic lives in the domain layer — explicit, testable without a database, and easy to evolve (e.g., exclude archived accounts, apply filters). For personal finance scale (dozens of accounts per user), in-memory aggregation has zero performance cost. The repository stays simple and framework-free.

**Alternative considered:** SQL `SUM(amount_cents) GROUP BY currency` in the repository. Rejected because it leaks business logic (grouping by currency is a domain rule) into the infrastructure layer, making it harder to test and evolve independently.

### 2. `amountCents` as bigint (not numeric)

**Choice:** Store balance as `bigint` representing cents (e.g., R$15.00 = 1500).

**Rationale:** Integer arithmetic avoids floating-point precision issues entirely. The frontend already expects `amountCents: number` and has `formatBRLFromCents()` utility. Bigint in PostgreSQL supports values up to 9.2 quintillion cents — more than sufficient. Drizzle returns bigint as string; the mapper converts to `number` (safe for personal finance amounts).

**Alternative considered:** Keep `numeric(12,2)` like `bank_accounts.initialBalance`. Rejected because cents-based integers are simpler for aggregation (`SUM` on integers is exact) and align with the frontend contract.

### 3. BankAccount promoted to AggregateRoot

**Choice:** Change `BankAccount extends Entity` to `BankAccount extends AggregateRoot`. The `CreateBankAccountUseCase` calls `bankAccount.addDomainEvent(new BankAccountCreatedEvent(...))` after creation.

**Rationale:** AggregateRoot extends Entity — this is a non-breaking change. The event buffer pattern is already implemented in the kernel. This is the first real use of the domain events infrastructure and establishes the pattern for all future cross-module communication.

**Alternative considered:** Keep as Entity and have the service directly call a balance creation method. Rejected because it couples bank-accounts to balances and bypasses the event infrastructure that was specifically designed for this.

### 4. Cross-module event in `shared/domain/events/`

**Choice:** `BankAccountCreatedEvent` lives in `shared/domain/events/`, not inside the bank-accounts module.

**Rationale:** Per the architectural decision in `learnings.md`: module-internal events go in `modules/<context>/domain/events/`, cross-module events go in `shared/domain/events/`. The balances module needs to import this event to listen for it — placing it in shared avoids a circular dependency between modules.

### 5. Event dispatch in Application Service (not UseCase)

**Choice:** `CreateBankAccountService` (the `@Injectable` wrapper) injects `DomainEventDispatcher` and calls `dispatcher.dispatchAll(bankAccount)` after the repository persist succeeds.

**Rationale:** Per the established pattern: the pure domain use-case creates the entity and buffers events. The application service orchestrates: persist first, then dispatch. The repository stays pure (no event awareness). This keeps the domain layer framework-free.

**Implementation change:** `CreateBankAccountService` currently extends `CreateBankAccountUseCase` directly. It needs to be refactored to compose (not extend) the use-case, so it can inject both the repository and the dispatcher.

### 6. Balance endpoint uses session auth (not URL userId)

**Choice:** `GET /api/balances` extracts userId from `@Session()`, ignoring any URL parameter.

**Rationale:** Consistent with `GET /api/bank-accounts` which also uses session-based scoping. The frontend currently passes userId in the URL (`/api/balances/:userId`), but the backend should use the session for security. The frontend `get-balance.ts` will need a minor update to not pass userId in the URL (or the backend ignores it).

**Decision:** Keep the frontend passing userId in the URL for now (it's used as a query key for React Query cache invalidation), but the backend route is `GET /api/balances` and userId comes from session only. The `:userId` in the URL is ignored.

### 7. CreateBankAccountService refactoring pattern

**Choice:** Change from `extends CreateBankAccountUseCase` to composition — the service holds a reference to the use-case and the dispatcher.

**Rationale:** The current pattern (`Service extends UseCase`) doesn't allow injecting additional dependencies like the dispatcher. Composition gives the service control over the orchestration flow: call use-case → persist → dispatch events.

```
// Before (inheritance):
class CreateBankAccountService extends CreateBankAccountUseCase {
  constructor(repo: BankAccountRepository) { super(repo); }
}

// After (composition):
class CreateBankAccountService {
  constructor(
    private readonly useCase: CreateBankAccountUseCase,
    private readonly dispatcher: DomainEventDispatcher,
  ) {}
  async execute(input) {
    const result = await this.useCase.execute(input);
    if (result.isSuccess) {
      await this.dispatcher.dispatchAll(result.value); // BankAccount is now AggregateRoot
    }
    return result;
  }
}
```

## Data Model

### `balances` table

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | `text` | PK | UUIDv4 |
| `user_id` | `text` | NOT NULL, FK → users.id (CASCADE) | Owner |
| `bank_account_id` | `text` | NOT NULL, FK → bank_accounts.id (CASCADE) | Source account |
| `amount_cents` | `bigint` | NOT NULL, DEFAULT 0 | Balance in cents |
| `currency` | `text` | NOT NULL, DEFAULT 'BRL' | ISO 4217 code |
| `updated_at` | `timestamp` | NOT NULL, DEFAULT now() | Last update |

**Indexes:** `(user_id)` for `findAllByUserId` query, `(bank_account_id)` UNIQUE for 1:1 with bank account.

### Event Flow

```
POST /api/bank-accounts (create)
  → CreateBankAccountService.execute()
    → CreateBankAccountUseCase.execute()
      → new BankAccount(...) + addDomainEvent(BankAccountCreatedEvent)
      → repository.create(bankAccount)
    → dispatcher.dispatchAll(bankAccount)
      → EventEmitter2.emit("BankAccountCreatedEvent", event)
        → OnBankAccountCreatedListener.handle(event)
          → balanceRepository.create(Balance.fromAccountCreated(event))

GET /api/balances (query)
  → GetUserBalancesController
    → GetUserBalancesService.execute({ userId })
      → GetUserBalancesUseCase.execute({ userId })
        → balanceRepository.findAllByUserId(userId)   ← raw rows, no aggregation
        → reduce rows by currency (in-memory)          ← domain logic
        → return Either<never, { amountCents, currency }[]>
```

### API Contract

**`GET /api/balances`** (authenticated)

Response `200`:
```json
[
  { "amountCents": 150000, "currency": "BRL" },
  { "amountCents": 50000, "currency": "USD" }
]
```

Response `401`: Unauthenticated

## Risks / Trade-offs

- **[Risk] Event listener failure** — If `OnBankAccountCreatedListener` fails, the bank account exists but has no balance row. → **Mitigation:** Log the error. The balance query uses `LEFT JOIN` or handles missing rows gracefully. A future reconciliation job can detect orphaned accounts.

- **[Risk] `bigint` → `number` overflow** — JavaScript `Number.MAX_SAFE_INTEGER` is ~9 quadrillion cents (~90 trillion currency units). → **Mitigation:** For personal finance this is a non-issue. Document the limit. If needed later, use `BigInt` in the domain layer.

- **[Risk] Migration drops `current_balance` column** — Existing data in that column is lost. → **Mitigation:** The column always equals `initialBalance` (no transactions exist to change it). The `initialBalance` column is preserved. No data loss of meaningful information.

- **[Trade-off] Frontend still passes userId in URL** — `GET /api/balances/:userId` in the frontend, but backend uses session. → **Mitigation:** Backend route is `GET /api/balances` and ignores URL params. Frontend can be updated later to remove the userId from the URL path. For now, the extra path segment is harmless.

## Migration Plan

1. Generate migration to drop `current_balance` from `bank_accounts` and create `balances` table
2. Run `bun run --filter @fincheck/api db:generate` then `db:migrate`
3. Rollback: drop `balances` table, add `current_balance` column back to `bank_accounts` with default 0

No data migration needed — `currentBalance` always equals `initialBalance` in existing rows.

## Open Questions

- Should the balance endpoint return empty array or 404 when user has no accounts? **Decision: empty array** — consistent with `GET /api/bank-accounts` returning `[]`.
- Should `OnBankAccountCreatedListener` set `amountCents` to `initialBalance * 100` (converting to cents)? **Decision: yes** — the bank account stores balance as decimal, the balance table stores as cents. The listener handles the conversion.
