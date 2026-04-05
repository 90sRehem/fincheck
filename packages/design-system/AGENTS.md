# @fincheck/design-system — Shared Component Library

React 19 component library with two-tier architecture, design tokens pipeline, and Vite library build.

## Stack

- **UI Framework:** React 19 + Radix UI primitives
- **Styling:** Tailwind CSS 4 + CVA + tailwind-variants + tailwind-merge
- **Icons:** lucide-react
- **Forms:** react-hook-form + Zod
- **Date:** date-fns + react-day-picker
- **Build:** Vite 7 (library mode, ESM + CJS)
- **shadcn/ui:** new-york style, neutral base color

## Structure

Two-tier component architecture:

- **`ui/` — Primitives:** Radix-based, CVA for variants, single-concern (Button, Dialog, Select, Input, Form, Avatar, Calendar, etc.)
- **`patterns/` — Composed:** Compound components using `tailwind-variants` (tv()), context pattern, domain-aware (InputField, DatePicker, CardLarge, Tabs, etc.)

```
src/
├── components/
│   ├── ui/              # Primitives tier
│   │   └── icons/       # Icon sub-exports (expense, revenue, account, general, colors)
│   └── patterns/        # Composed tier
│       └── card/        # Complex patterns get subdirectories
├── tokens/              # Design tokens (TS) + CSS generator
│   └── theme.css        # Generated output (DO NOT EDIT)
├── lib/                 # cn() utility (clsx + tailwind-merge)
├── assets/              # SVG assets
├── index.ts             # Main barrel export
└── index.css            # CSS entry (Tailwind + tokens)
```

## Commands

| Command | Purpose |
|---|---|
| `bun run dev` | Watch tokens + rebuild lib (concurrently) |
| `bun run build` | Build tokens → build library |
| `bun run build:tokens` | Generate theme.css from TS tokens (tsx) |

## shadcn/ui Config

- Style: **new-york** (not default)
- Base color: **neutral**
- Icon library: **lucide**
- CSS variables: enabled
- Path alias: `@/` → `./src/`
- No RSC (library mode, not Next.js)

## Adding Components

1. Check shadcn/ui CLI first: `bunx shadcn@latest add <component>`
2. Customize for project needs
3. ui/ tier for primitives, patterns/ tier for composed
4. Compound patterns: use `Object.assign` + Context
5. Export via barrel (ui/index.ts or patterns/index.ts)

## Known Issues

- **Duplicate heading utilities** in theme.css (lines 156-182 and 282-315) — css-generator.ts runs both tokenUtilities and headingUtilities without dedup
- **`vite-plugin-tokens.ts` unused** — dev script uses nodemon instead, file contains orphan code
- **Radii tokens not emitted** — radii.ts exists but commented out in css-generator.ts
- **Orange palette missing shade 5** — colors.ts jumps from 4 to 6

For deep internals (token pipeline, icon conventions, build config, compound patterns), load the `fincheck-design-system` skill.
