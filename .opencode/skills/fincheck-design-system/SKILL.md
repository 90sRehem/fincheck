---
name: fincheck-design-system
description: Design system internals - two-tier component architecture (ui primitives + patterns composed), token pipeline (TS to CSS generation), icon system, Vite library build, shadcn/ui conventions
---

# Fincheck Design System Internals

Deep dive into design system architecture, token pipeline, and build system.

## Two-Tier Architecture

**Tier 1: ui/ (Primitives)**
- CVA for variants
- Radix UI base
- Single-concern components
- Export variant function + component + types

**Tier 2: patterns/ (Composed)**
- `tailwind-variants` (tv()) for slot-based variants
- Compound component via `Object.assign(Root, { Sub1, Sub2 })`
- Context pattern for state
- Composes ui/ primitives
- Domain-aware

**Example compound pattern:**
```typescript
const Root = ({ children }) => <Context.Provider>...</Context.Provider>;
const Sub = () => { const ctx = useContext(); return <ui.Primitive />; };

export const Component = Object.assign(Root, { Sub });

// Usage: <Component><Component.Sub /></Component>
```

## Token Pipeline

**Flow:** TS tokens → css-generator.ts → theme.css → Tailwind v4 → utility classes

**1. Define tokens (TS):**
```typescript
// src/tokens/colors.ts
export const colors = {
  teal: { 0: "#f3faf9", 1: "#e6f5f3", ..., 9: "#004440" },
  // 14 palettes x 10 shades
};

// src/tokens/typography.ts
export const typography = {
  heading1: { fontSize: "2.5rem", fontWeight: 700, ... },
  bodyLargeRegular: { fontSize: "1.1rem", fontWeight: 400, ... },
};
```

**2. Generate CSS:**
```typescript
// scripts/build-tokens.ts
import { generateTailwindTheme } from "../src/tokens/css-generator";
fs.writeFileSync("./src/tokens/theme.css", generateTailwindTheme());
```

**3. Output (theme.css):**
```css
@theme {
  --color-teal-0: #f3faf9;
  --color-teal-9: #004440;
  --spacing-4: 1rem;
  --font-family-base: "DM Sans", system-ui, sans-serif;
}

@utility heading-1 {
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 3rem;
  letter-spacing: -0.05em;
}
```

**4. Tailwind auto-generates:**
- `bg-teal-9`, `text-teal-0`, `p-4`, `font-base`
- Custom utilities: `heading-1`, `body-large-regular`

## Icon System

**Category-based exports:**

| Category | Import Path | Namespace |
|---|---|---|
| Expense | `@fincheck/design-system/icons/expense` | `Expense.Food`, `Expense.Home`, etc. |
| Revenue | `@fincheck/design-system/icons/revenue` | `Revenue.CurrentAccount`, etc. |
| Account | `@fincheck/design-system/icons/account` | `Account.Money`, etc. |
| General | `@fincheck/design-system/icons/general` | `General.Transactions`, etc. |
| Colors | `@fincheck/design-system/icons/colors` | `Colors.Teal`, `Colors.Gray`, etc. |

**Architecture:**
- `.tsx` files: SVG React components
- `.ts` files: Namespace aggregators (`export const Expense = { Food, Home, ... }`)
- Vite builds separate entry point per category → tree-shaking

**Usage:**
```typescript
import { Expense } from "@fincheck/design-system/icons/expense";
<Expense.Food />
```

## Vite Library Build

**6 entry points:**
```typescript
entry: {
  index: "./src/index.ts",              // Main barrel
  "icons/expense": "./src/components/ui/icons/expense.ts",
  "icons/revenue": "./src/components/ui/icons/revenue.ts",
  "icons/account": "./src/components/ui/icons/account.ts",
  "icons/general": "./src/components/ui/icons/general.ts",
  "icons/colors": "./src/components/ui/icons/colors.ts",
}
```

**Output:** ESM + CJS for each entry, single `design-system.css`

**package.json exports:**
```json
{
  ".": { "types": "./dist/index.d.ts", "import": "./dist/index.es.js", "require": "./dist/index.cjs.js" },
  "./styles": "./dist/design-system.css",
  "./icons/expense": { "types": "./dist/icons/expense.d.ts", ... }
}
```

## shadcn/ui Config

**File:** `components.json`

- Style: `new-york` (not default)
- Base color: `neutral`
- Icon library: `lucide`
- Path alias: `@/` → `src/`
- No RSC (library, not Next.js)
- CSS variables: enabled

**Adding components:**
```bash
bunx shadcn@latest add button
# Customizes for project, adds to src/components/ui/
```

## Component Creation Workflow

1. **Check shadcn/ui first:** `bunx shadcn@latest add <name>`
2. **Tier decision:**
   - **ui/** if primitive (single Radix component, CVA variants)
   - **patterns/** if composed (uses ui/ internally, compound pattern)
3. **Compound pattern:** Use `Object.assign` + Context
4. **Export via barrel:** ui/index.ts or patterns/index.ts
5. **Story:** Create parallel story in apps/docs

## Token Dev Workflow

**Watch mode:**
```bash
bun run dev
# Runs: concurrently "nodemon --watch src/tokens ..." "vite build --watch"
```

**Manual rebuild:**
```bash
bun run build:tokens
```

**Files watched:** `src/tokens/*.ts` (ignores theme.css to prevent loop)

## Known Issues

1. **Duplicate `@utility` headings** — css-generator.ts generates heading-1 through heading-5 twice (lines 156-182 and 282-315)
2. **vite-plugin-tokens.ts unused** — orphan code, dev uses nodemon instead
3. **Radii tokens not emitted** — radii.ts exists but commented out in css-generator.ts:20-22,46-51
4. **Orange palette missing shade 5** — colors.ts:146-156 jumps from 4 to 6

## API Reference

**cn() utility:**
```typescript
import { cn } from "@fincheck/design-system";
cn("base-class", condition && "conditional-class", { "bg-red": isError });
```

**Component variant access:**
```typescript
import { buttonVariants, type ButtonVariant } from "@fincheck/design-system";
const classes = buttonVariants({ variant: "primary", intent: "destructive" });
```
