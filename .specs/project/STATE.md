# Fincheck State

## Preferences

- Model guidance: This project benefits from reasoning-heavy models for architecture decisions and DDD pattern implementation.

## Decisions

| ID | Decision | Rationale | Date |
|---|---|---|---|
| D1 | Use DDD for backend modules | Clear separation between domain logic and infrastructure. Use-cases are pure, services are injectable wrappers. | 2026-04-09 |
| D2 | Use FSD for frontend | Simplified FSD variant (app > pages > entities > shared). Clean layer hierarchy, no features/widgets yet. | 2026-04-09 |
| D3 | Use Drizzle ORM | Type-safe SQL, migration system, relational query API. Integrates well with NestJS via custom DI. | 2026-04-09 |
| D4 | Use better-auth | Full-featured auth solution with session management, email/password, OAuth support ready. NestJS adapter available. | 2026-04-09 |
| D5 | No TypeScript enums | Use `as const` objects with derived union types. Exception: PostgreSQL pgEnum in Drizzle schemas. | 2026-04-09 |
| D6 | No Redux/Zustand | TanStack Query for server state, custom stores for client-only state (balance visibility, period selector). | 2026-04-09 |

## Blockers

| ID | Blocker | Impact | Date |
|---|---|---|---|
| B1 | Transactions backend module missing | Frontend UI is ready but no API to connect. Dashboard incomplete without transaction data. | 2026-04-09 |
| B2 | Categories backend module missing | Transactions need categories, but no backend support. Spending breakdown cannot work. | 2026-04-09 |
| B3 | Users backend module empty | User profile fetching relies on frontend-only. No dedicated user API module. | 2026-04-09 |

## Lessons Learned

| ID | Lesson | Context |
|---|---|---|
| L1 | Frontend built ahead of backend | Transaction, category, balance UI exists but APIs missing. This is okay — UI drives API design. |
| L2 | Bank accounts module is reference implementation | Full DDD structure with use-cases, repository pattern, mappers. Use as template for new modules. |

## Todos

| ID | Task | Priority | Feature |
|---|---|---|---|
| T1 | Create transactions backend module | high | M3 |
| T2 | Create categories backend module | high | M4 |
| T3 | Wire transactions API to frontend | high | M3 |
| T4 | Wire categories API to frontend | high | M4 |
| T5 | Implement balance calculation API | medium | M5 |
| T6 | Verify bank accounts delete works end-to-end | medium | M2 |
| T7 | Fix stale test files | low | — |
| T8 | Document deployment setup | low | M5 |

## Deferred Ideas

- Multi-currency support (post-v1)
- Bank sync / Open Banking integration (post-v1)
- Mobile app (post-v1)
- Budget system (post-v1)
- Goals and investments tracking (post-v1)
- Recurring transactions (post-v1)