# Proposal: transactions-backend

## Problem

The frontend SPA (`apps/web`) has a fully-built transaction feature (~2,700 LOC in `pages/home/`) that expects 5 REST endpoints under `/api/transactions`. The backend has no `transactions` module — the frontend is blocked on real data.

The frontend contract is well-defined:
- **5 endpoints:** GET list (paginated + filtered), GET by id, POST create, PUT update, DELETE remove
- **Response shape:** `Transaction` with `id`, `userId`, `accountId`, `title`, `amountCents`, `type`, `color`, `category`, `date`, timestamps
- **Pagination:** `x-total-count` header + `_page`/`_limit`/`_sort`/`_order` query params
- **Filtering:** by `accountId`, `year`, `month`, `type`

## Solution

Implement the `TransactionsModule` following the exact same DDD pattern as `BankAccountsModule`:

1. **Domain layer** — `Transaction` entity (extends `AggregateRoot`), `TransactionRepository` abstract class, 5 pure use-cases, `TransactionValidator` (Zod), `TRANSACTION_TYPE` value object
2. **Infrastructure layer** — Drizzle `transactions` table schema with FK to `users` and `bank_accounts`, `DrizzleTransactionRepository` with full pagination/filtering, `TransactionMapper`
3. **Application layer** — 5 `@Injectable()` services (each extends its use-case), DTOs with Zod schemas
4. **Presentation layer** — `TransactionsController` (single controller, 5 endpoints)
5. **Wiring** — module registration, schema-registry update, app.module.ts import

## Dependencies

| Dependency | Status | Impact |
|---|---|---|
| `BankAccountsModule` | Exists | FK from `transactions.account_id` → `bank_accounts.id` |
| `CategoriesModule` | Does NOT exist | `category` stored as plain `text` (no FK). Category module deferred. |
| `BalancesModule` | Exists | Future: transaction create/delete should emit domain events to update balances. Deferred to separate change. |
| Shared domain kernel | Exists | `Entity`, `AggregateRoot`, `Either`, `UseCase`, `ZodValidationStrategy`, `NotFoundError` |

## Risk Assessment

| Risk | Level | Mitigation |
|---|---|---|
| Schema migration | Medium | New table, no existing data to migrate. Reviewed drizzle-kit workflow. |
| FK integrity | Low | `account_id` references existing `bank_accounts` table with `onDelete: cascade` |
| Balance impact | Deferred | Domain events for balance recalculation out of scope — separate change |
| Frontend contract mismatch | Low | Types derived directly from `apps/web/src/pages/home/api/transactions.ts` |

## Success Criteria

- [ ] All 5 endpoints respond correctly (201, 200, 200, 200, 204)
- [ ] `GET /api/transactions` supports pagination with `x-total-count` header
- [ ] `GET /api/transactions` supports filtering by `accountId`, `year`, `month`, `type`
- [ ] `GET /api/transactions` supports sorting via `_sort` and `_order`
- [ ] `turbo check-types` passes with zero errors
- [ ] `bun run lint` passes
- [ ] Frontend can fetch, create, update, and delete transactions against real API
- [ ] Swagger docs render all 5 endpoints under "Transactions" tag

## Scope Exclusions

- Balance recalculation on transaction CRUD (separate change with domain events)
- Categories module (category stored as plain text for now)
- Transaction import/export
- Recurring transactions
