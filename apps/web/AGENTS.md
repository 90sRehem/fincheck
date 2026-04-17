# @fincheck/web — Frontend SPA

React 19 SPA with Feature-Sliced Design architecture, TanStack Router/Query, and Tailwind CSS 4.

## Stack

- **Framework:** React 19 + Vite 7
- **Routing:** TanStack Router (file-based)
- **State:** TanStack Query + custom stores (not Redux/Zustand)
- **Styling:** Tailwind CSS 4 + design tokens from `@fincheck/design-system`
- **Forms:** react-hook-form + Zod + `@hookform/resolvers`
- **HTTP:** Custom `FetchHttpClient` abstraction (not raw fetch/axios)
- **Testing:** Vitest + Testing Library + jsdom

## Structure (Feature-Sliced Design)

```
src/
├── app/          # Providers, router config, guards (auth/guest), global styles
├── pages/        # Home (dashboard), Session (login/register)
├── entities/     # Session, Users, Balance — each with api/model/ui slices
└── shared/       # HTTP client, stores, storage, token/user services, error handling, config
```

**Simplified FSD variant** — no `features/` or `widgets/` layers yet. Layer hierarchy: `app` > `pages` > `entities` > `shared`.

## Commands

| Command | Purpose |
|---|---|
| `bun run dev` | Vite dev server (port 3000) |
| `bun run build` | Production build + type check |
| `bun run test` | Vitest tests |
| `bun run lint` | Biome lint |
| `bun run format` | Biome format |

## Key Conventions

### Imports
- **Path alias:** `@/*` maps to `src/*` (configured in both tsconfig.json and vite.config.ts)
- **Design system:** `import { Button, InputField } from "@fincheck/design-system"`
- **Cross-layer:** Always through barrel exports (`@/entities/session`, `@/shared/api`, `@/pages/home`)
- **Within slice:** Relative imports (`../model/use-login`, `./header`)
- **FSD rule:** Layers import only from layers below (app > pages > entities > shared)

### File Naming
- **Components:** kebab-case files, PascalCase exports (`home-page.tsx` exports `HomePage`)
- **Stores:** `*-store.ts` (e.g., `session-store.ts`, `balance-visibility-store.ts`)
- **Hooks:** `use-*.ts` (e.g., `use-login.ts`, `use-balance.ts`)
- **Schemas:** `*-schema.ts` (e.g., `create-transaction-schema.ts`)
- **Props:** Wrapped in `Readonly<>` (`props: Readonly<PropsWithChildren>`)

## Caveats

- **Minimal tests:** Only 1 test file exists (create-store.test.ts)
- **Module Federation commented out:** `@module-federation/vite` is a dependency but unused in vite.config.ts

For detailed conventions (state management, routing, HTTP client, forms, error handling), load the `react-fsd` skill.
For FSD layer hierarchy, slice anatomy, import rules, and architecture patterns, load the `feature-sliced-design` skill.
