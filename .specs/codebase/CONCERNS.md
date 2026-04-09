# Codebase Concerns

**Analysis Date:** 2026-04-09

## Tech Debt

### API Client Hardcoded Base URL

- **Issue:** Frontend API client hardcoded to `http://localhost:8000` instead of using environment config
- **Files:** `apps/web/src/shared/api/api-client.ts:5`
- **Why:** Likely development oversight — dev used json-server on port 8000
- **Impact:** Production API calls will fail (wrong base URL)
- **Fix approach:** Use environment variable (import from `@/shared/config`)

### Shared Domain Imports Missing Path Alias

- **Issue:** Bank accounts use-cases fail to import from `@/shared/domain/` — LSP errors show "Cannot find module"
- **Files:**
  - `apps/api/src/modules/bank-accounts/create-bank-account.use-case.ts`
  - `apps/api/src/modules/bank-accounts/update-bank-account.use-case.ts`
  - `apps/api/src/modules/bank-accounts/delete-bank-account.use-case.ts`
- **Why:** `@/shared` path may not be configured in TypeScript for those modules
- **Impact:** Build failures, broken imports
- **Fix approach:** Verify tsconfig.json includes `@/shared` alias in all modules

---

## Known Bugs

### Stale Test Expectation

- **Symptoms:** Test fails when run
- **Trigger:** Run `bun run --filter @fincheck/api test`
- **Files:** `apps/api/src/app.controller.spec.ts:18-20`
- **Workaround:** None — test needs update
- **Root cause:** Test expects `"Hello World!"` but `AppService.healthCheck()` returns `"healthy"`
- **Blocked by:** N/A — can fix immediately

---

## Security Considerations

### CORS Wide Open

- **Risk:** No origin restrictions on API CORS
- **Files:** `apps/api/src/main.ts:13` — `app.enableCors()` with no options
- **Current mitigation:** None
- **Recommendations:** Add `origin` option to restrict to frontend origins (e.g., `http://localhost:3000`)

### Token Storage Client-Side

- **Risk:** Auth token stored in localStorage (vulnerable to XSS)
- **Files:** `apps/web/src/shared/lib/token/token-service.ts`
- **Current mitigation:** Token expiration handling on 401
- **Recommendations:** Consider httpOnly cookies for session token (better-auth supports this), but requires backend proxy setup

---

## Performance Bottlenecks

### No Performance Issues Detected

No measurable performance bottlenecks identified in current codebase. Database queries are simple CRUD, no N+1 patterns observed in current implementation.

---

## Fragile Areas

### API Base URL Coupling

- **Files:** `apps/web/src/shared/api/api-client.ts`
- **Why fragile:** Hardcoded localhost:8000 means any environment change breaks the app
- **Common failures:** Deploy to production → API calls fail silently
- **Safe modification:** Add env config, use process.env
- **Test coverage:** None

### Frontend Runs Ahead of Backend

- **Files:** `apps/web/src/pages/home/api/transactions.ts`, `categories.ts`, `colors.ts`
- **Why fragile:** Frontend makes API calls to endpoints that don't exist (transactions, categories modules missing)
- **Common failures:** UI loads but actions fail with 404
- **Safe modification:** Create backend modules to match frontend expectations
- **Test coverage:** None

---

## Scaling Limits

### No Scaling Analysis Needed

This is a v1 personal finance app — scaling concerns are premature. Current architecture (PostgreSQL + NestJS) handles thousands of users easily.

---

## Dependencies at Risk

### No Critical Dependencies at Risk

All major dependencies are actively maintained:

- NestJS 11 — current
- better-auth 1.4.18 — active development
- Drizzle ORM 0.45.1 — active
- React 19 — current
- Vite 7 — current

---

## Missing Critical Features

### Transactions Backend Module

- **Problem:** No backend module for transactions — frontend API calls will 404
- **Current workaround:** Users cannot create/view transactions
- **Blocks:** M3 (Transactions) milestone
- **Implementation complexity:** Medium — requires Drizzle schema, CRUD use-cases, controller, frontend wiring

### Categories Backend Module

- **Problem:** No backend module for categories — spending breakdown cannot work
- **Current workaround:** Users cannot categorize transactions
- **Blocks:** M4 (Categories) milestone
- **Implementation complexity:** Low-Medium — simpler than transactions

### Balance Calculation API

- **Problem:** No backend to compute balance from initial + transactions
- **Current workaround:** Displays initial balance only
- **Blocks:** Dashboard completeness
- **Implementation complexity:** Low — aggregation query

---

## Test Coverage Gaps

### Bank Accounts Module

- **What's not tested:** Use-cases, repository, controllers
- **Risk:** CRUD bugs could go unnoticed
- **Priority:** High
- **Difficulty to test:** Medium — requires test DB or mocks

### Frontend Components

- **What's not tested:** React components, hooks
- **Risk:** UI bugs, broken interactions
- **Priority:** Medium
- **Difficulty to test:** Low-Medium — Vitest + Testing Library available

### API Endpoints

- **What's not tested:** HTTP layer (controllers)
- **Risk:** Invalid requests accepted, valid requests rejected
- **Priority:** High
- **Difficulty to test:** Medium — requires supertest or E2E tests

---

## Summary

| Category | Count | Priority |
|---|---|---|
| Tech Debt | 2 | High (API client), Medium (imports) |
| Known Bugs | 1 | Low (easy fix) |
| Security | 2 | Medium |
| Fragile Areas | 2 | High |
| Missing Features | 3 | High (blocks v1) |
| Test Gaps | 3 | High |

**Immediate action items:**

1. Fix API client base URL (production blocker)
2. Create transactions module (blocks core feature)
3. Create categories module (blocks spending breakdown)
4. Fix stale test expectation

---

_Concerns audit: 2026-04-09_
_Update as issues are fixed or new ones discovered_