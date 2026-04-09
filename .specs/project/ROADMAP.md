# Fincheck Roadmap

## v1 Milestones

### M1: Authentication ✅ Done

**Status:** Complete

**Scope:**

- better-auth setup with email + password provider
- PostgreSQL-backed session storage
- Global auth guard for protected routes
- Public routes for login/register pages
- Token-based session management on frontend

**Files:**

- `apps/api/src/core/auth/` — auth config, module, provider
- `apps/web/src/entities/session/` — session store, login/register hooks
- `apps/web/src/pages/session/` — login/register pages

---

### M2: Bank Accounts ⚠️ ~80% Complete

**Status:** Backend done, frontend done, integration gaps

**Scope:**

- Backend CRUD for bank accounts
- Frontend account list, add, edit, delete UI
- Account types: checking, savings, credit_card, cash, investment
- Initial balance and current balance tracking
- Color and icon per account

**Backend (done):**

- `apps/api/src/modules/bank-accounts/` — full DDD structure
- Controllers, use-cases, repository, Drizzle schema
- Module registered in app.module.ts

**Frontend (done):**

- `apps/web/src/pages/home/ui/accounts-list.tsx` — account list UI
- `apps/web/src/pages/home/api/accounts.ts` — API calls
- `apps/web/src/pages/home/model/use-add-account.ts` — create hook
- Add account dialog in `add-accounts.tsx`

**Gaps:**

- Update account functionality exists in API but may need frontend wiring
- Delete account UI may need verification
- Account balance calculation (initial + transactions) not implemented

---

### M3: Transactions (Backend)

**Status:** Backend missing

**Scope:**

- Transaction CRUD API
- Fields: accountId, amount, type (income/expense), description, date, categoryId
- List with filters: by account, by period (month/year), by type
- Delete and update operations

**Backend needed:**

- New module: `modules/transactions/`
- Drizzle schema for transactions table
- CRUD use-cases and controllers
- Repository pattern implementation
- Mapper for domain/persistence conversion

**Frontend (already built):**

- `apps/web/src/pages/home/api/transactions.ts`
- `apps/web/src/pages/home/ui/transactions-list.tsx`
- `apps/web/src/pages/home/ui/transaction.tsx`
- Add expense/revenue dialogs in `add-expense.tsx`, `add-revenue.tsx`
- Update/remove transaction in `update-transaction.tsx`, `remove-transaction.tsx`
- Transaction filters in `filters.tsx`

---

### M4: Categories & Color System (Backend)

**Status:** Backend missing

**Scope:**

- Category CRUD (predefined + custom)
- Predefined categories: food, transport, housing, utilities, entertainment, health, education, shopping, salary, investment, other
- Color assignment per category
- Category icons/mapping for UI

**Backend needed:**

- New module: `modules/categories/`
- Drizzle schema for categories table
- CRUD operations (likely seed-based for predefined)
- Color schema (separate table or enum)

**Frontend (already built):**

- `apps/web/src/pages/home/api/categories.ts`
- `apps/web/src/pages/home/api/colors.ts`
- `apps/web/src/pages/home/model/use-categories-list.ts`
- `apps/web/src/pages/home/model/use-list-colors.ts`
- Category mapping in `lib/category-mapping.ts`

---

### M5: Dashboard & Polish

**Status:** Pending

**Scope:**

- Balance calculations across all accounts
- Period-based balance summaries
- Recent transactions on dashboard
- Spending breakdown by category (visual)
- Deployment (Docker Compose, Railway, or self-hosted)

**Needed:**

- Backend API to compute balances from transactions
- Frontend balance display wiring
- Breakdowns/charts (existing UI needs data)
- Environment setup docs for deployment

---

## Post-v1 (Out of Scope)

- Budget setting and tracking
- Financial goals
- Investment tracking
- Recurring transactions
- Bank sync / Open Banking
- CSV/OFX import
- Multi-currency
- Mobile app (PWA or React Native)
- Notifications and alerts
- PDF/printable reports