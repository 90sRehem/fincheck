# Fincheck — Personal Finance App

Bun + Turborepo monorepo for personal finance management.

## Monorepo Map

| Package | Purpose | Key Tech |
|---|---|---|
| `apps/api` | Backend API — authentication, data persistence | NestJS 11, Drizzle, better-auth, PostgreSQL |
| `apps/web` | Frontend SPA — dashboard for managing finances | React 19, FSD architecture, TanStack |
| `apps/docs` | Storybook visual documentation for design system | Storybook 10, ESLint (not Biome) |
| `packages/design-system` | Shared component library and design tokens | Radix UI, shadcn/ui, Tailwind v4 |
| `packages/ts-config` | Shared TypeScript configurations (base, node, react) | TypeScript 5.9 strict configs |

## Commands

```bash
bun install                                    # Install all workspace dependencies
turbo dev                                      # Start all apps in dev mode
turbo build                                    # Build all packages (topological order)
turbo check-types                              # Type check all packages
bun run lint                                   # Lint entire monorepo (Biome)
bun run format                                 # Format entire monorepo (Biome)
bun run --filter @fincheck/api dev             # Start API only (port 3333)
bun run --filter @fincheck/web dev             # Start web only (port 3000)
bun run --filter @fincheck/api db:generate     # Generate migration from schema
bun run --filter @fincheck/api db:migrate      # Run migrations
bun run --filter @fincheck/api db:studio       # Open Drizzle Studio
```

## Workspace Import Rules

- **Import shared packages:** Use workspace names (`@fincheck/design-system`, `@fincheck/ts-config`)
- **NEVER import between apps:** Apps (`api`, `web`, `docs`) must not import from each other
- **Path aliases:** Frontend/design-system use `@/*` → `src/*`; backend uses relative imports

## Code Conventions

- **No TypeScript enums:** Never use `enum`. Use `as const` objects with derived union types instead:

  ```ts
  // Correct
  export const BANK_ACCOUNT_TYPE = {
    CHECKING: "checking",
    SAVINGS: "savings",
  } as const;
  export type BankAccountType = typeof BANK_ACCOUNT_TYPE[keyof typeof BANK_ACCOUNT_TYPE];

  // Wrong — never do this
  export enum BankAccountType { CHECKING = "checking", SAVINGS = "savings" }
  ```

  PostgreSQL `pgEnum` in Drizzle schemas is allowed — this rule applies only to TypeScript.

## On-Demand Skills

Load via `skill` tool only when the task requires it:

- `nestjs-ddd` — Backend module structure, entity/VO patterns, use-case conventions
- `nestjs-modular-monolith` — Bounded contexts, module boundaries, event communication, state isolation, CQRS (optional)
- `react-fsd` — Frontend FSD layers, state management, routing, HTTP client patterns
- `fincheck-design-system` — Component tiers, token pipeline, icon system, build config
- `fincheck-database` — Drizzle schema, migrations, DI patterns, better-auth tables
- `fincheck-tooling` — Biome, Bun, Turborepo, Docker, Terraform configs
- `fincheck-code-quality` — Biome rule rationale, TS strict patterns, naming conventions

## Vault de Memória Persistente

O vault centralizado do projeto fica em `~/Documents/dev/projets-wiki/`.

### Regra de Consulta em 3 Camadas

1. **Primeiro:** consultar `graphify-out/graph.json` ou `graphify-out/GRAPH_REPORT.md` para estrutura do código
2. **Segundo:** consultar `~/Documents/dev/projets-wiki/fincheck/` para decisões, progresso e contexto
3. **Terceiro:** ler arquivos de código bruto apenas ao editar

### Comandos de Sessão

- `/resume` — ler logs recentes em `~/Documents/dev/projets-wiki/fincheck/logs/` + `architecture/decisions.md`, resumir estado atual
- `/save` — criar log em `~/Documents/dev/projets-wiki/fincheck/logs/YYYY-MM-DD-descricao.md` com o que foi feito, decisões e pendências

## graphify

This project has a graphify knowledge graph at graphify-out/.

Rules:

- Before answering architecture or codebase questions, read graphify-out/GRAPH_REPORT.md for god nodes and community structure
- If graphify-out/wiki/index.md exists, navigate it instead of reading raw files
- After modifying code files in this session, run `python3 -c "from graphify.watch import _rebuild_code; from pathlib import Path; _rebuild_code(Path('.'))"` to keep the graph current
