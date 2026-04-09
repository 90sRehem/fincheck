# Tech Stack

**Analyzed:** 2026-04-09

## Core

- **Runtime:** Bun 1.2.23
- **Package Manager:** Bun (workspace)
- **Build System:** Turborepo 2.5.8
- **Language:** TypeScript 5.9.x (strict)

## Monorepo Structure

| Package | Purpose |
|---|---|
| `apps/api` | NestJS 11 backend with Drizzle ORM |
| `apps/web` | React 19 SPA with TanStack |
| `apps/docs` | Storybook 10 documentation |
| `packages/design-system` | Shared component library |
| `packages/ts-config` | Shared TypeScript configs |

---

## Backend (`apps/api`)

| Category | Technology |
|---|---|
| Framework | NestJS 11.0.1 + Express |
| Database | PostgreSQL 15 + Drizzle ORM 0.45.1 |
| Auth | better-auth 1.4.18 + @thallesp/nestjs-better-auth 2.4.0 |
| Validation | Zod 4.3.6 |
| API Docs | @nestjs/swagger 11.2.6 + @scalar/nestjs-api-reference 1.0.23 |
| Events | @nestjs/event-emitter 2.0.5 |
| Testing | Vitest 3.2.3 + @nestjs/testing 11.0.1 |
| UUID | uuid 13.0.0 |

**Build/Run:**

- `nest build` → compile to `dist/`
- `nest start --watch` → dev with hot reload
- `drizzle-kit` for migrations (generate/migrate/studio)

---

## Frontend (`apps/web`)

| Category | Technology |
|---|---|
| Framework | React 19.2.0 + Vite 7.1.7 |
| Routing | TanStack React Router 1.132.0 |
| State/Query | TanStack React Query 5.66.5 |
| Styling | Tailwind CSS 4.1.16 + @tailwindcss/vite |
| Forms | react-hook-form 7.66.0 + Zod + @hookform/resolvers |
| UI Components | @fincheck/design-system (workspace) |
| Icons | lucide-react 0.545.0 |
| Error Handling | react-error-boundary 6.0.0 |
| Testing | Vitest 3.0.5 + Testing Library |

**Commands:**

- `vite --port 3000` → dev server
- `vite build && tsc` → production build
- `vitest run` → tests

---

## Design System (`packages/design-system`)

| Category | Technology |
|---|---|
| UI Primitives | Radix UI (dialog, select, popover, etc.) |
| Styling | Tailwind CSS 4 + CVA + tailwind-variants + tailwind-merge |
| Icons | lucide-react |
| Forms | react-hook-form + Zod |
| Date | date-fns + react-day-picker |
| Build | Vite 7 (library mode: ESM + CJS) |
| Testing | Vitest + ESLint |

**Structure:** Two-tier (ui/ primitives, patterns/ composed)

---

## Documentation (`apps/docs`)

| Category | Technology |
|---|---|
| Framework | Storybook 10.1.11 |
| Build | Vite 7.2.4 |
| Testing | Playwright + Vitest |
| Linting | ESLint (NOT Biome — different from rest of monorepo) |

---

## Development Tools

| Tool | Purpose |
|---|---|
| Biome 2.2.5 | Lint + Format (root config, docs uses ESLint) |
| TypeScript 5.9.2 | Type checking across all packages |
| Turbo 2.5.8 | Task orchestration and caching |
| nodemon | Watch mode for design-system token generation |
| concurrently | Run multiple dev scripts in parallel |

---

## External Services

| Category | Integration |
|---|---|
| Database | PostgreSQL 15 (local/Docker) |
| Auth Provider | better-auth (self-hosted, email + password) |
| API Docs | Swagger + Scalar (built into API) |

No third-party external services (Stripe, Plaid, etc.) — all self-hosted.