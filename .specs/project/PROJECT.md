# Fincheck

**Vision:** Comprehensive personal finance platform for individuals to track accounts, categorize transactions, set budgets, and gain full visibility into their financial health.
**For:** Individual users (public product)
**Solves:** Fragmented personal finance tracking — consolidates accounts, spending, and planning into a single clean dashboard.

## Goals

- Users can manage multiple bank accounts and track balances in real-time
- Full transaction lifecycle with categorization and spending breakdowns
- Clean, responsive dashboard with period filtering and visual summaries

## Tech Stack

**Core:**

- Runtime: Bun
- Build: Turborepo monorepo
- Backend: NestJS 11 + Express
- Frontend: React 19 + Vite 7
- Database: PostgreSQL 15 + Drizzle ORM
- Auth: better-auth + @thallesp/nestjs-better-auth
- State: TanStack Router + TanStack Query
- Styling: Tailwind CSS 4 + Radix UI + shadcn/ui

**Key dependencies:** Zod, date-fns, react-hook-form, lucide-react, CVA, tailwind-variants

## Scope

**v1 includes:**

- Authentication (email + password via better-auth)
- Bank account CRUD (checking, savings, credit card, cash, investment)
- Transaction CRUD with date/period filtering
- Category system for transactions
- Spending breakdowns and visual summaries
- Dashboard with account balances and recent transactions
- Period selector (month/year filtering)

**Explicitly out of scope:**

- Bank sync / Open Banking / CSV imports
- Multi-currency (BRL only)
- Mobile app (web only)
- Budget setting and tracking
- Financial goals and investments
- Recurring transactions

## Constraints

- Currency: BRL (Brazilian Real) only
- No hard deadlines or budget limits
- Self-hosted friendly (Docker Compose, PostgreSQL 15)