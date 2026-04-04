# @fincheck/docs — Storybook Documentation

Storybook 10 visual documentation site for the design system.

## Stack

- **Framework:** Storybook 10
- **Components:** React 19 from `@fincheck/design-system`
- **Build:** Vite 7
- **Testing:** Playwright (browser), Vitest
- **Linter:** ESLint (NOT Biome — different from rest of monorepo)

## Structure

```
src/stories/
├── ui/        # Component stories (mirrors design-system ui/ tier)
└── patterns/  # Pattern stories (mirrors design-system patterns/ tier)

.storybook/
├── main.ts            # Storybook config
├── preview.ts         # Global decorators, parameters
└── vitest.setup.ts    # Vitest config for Storybook tests
```

## Commands

| Command | Purpose |
|---|---|
| `bun run storybook` | Dev server (default port) |
| `bun run build-storybook` | Static build for deployment |

## Key Conventions

- **Story naming:** `ComponentName.stories.tsx`
- **Structure mirrors design-system:** ui/ stories for ui/ components, patterns/ stories for patterns/ components
- **Uses ESLint, not Biome:** This is the ONLY package in the monorepo using ESLint
- **Import from design system:** `import { Component } from "@fincheck/design-system"`

For component tiers, props, and variants details, load the `fincheck-design-system` skill.
