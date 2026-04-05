## Context

The design system token pipeline flows: **TS token files** → `css-generator.ts` → `theme.css` → **Tailwind v4 utilities**. Four source files define the tokens (`colors.ts`, `typography.ts`, `spacing.ts`, `shadow.ts`), plus `radii.ts` which exists but is disconnected. A Figma-vs-code audit found the generated `theme.css` has bugs (duplicate headings, missing values) and multiple token values that diverge from the Figma Styleguide source of truth.

All changes are confined to `packages/design-system/src/tokens/`. No component API changes, no dependency additions.

## Goals / Non-Goals

**Goals:**
- Fix all token bugs that produce incorrect CSS output
- Align every token value with the Figma Styleguide (node `14:350`)
- Enable radii and blur tokens in the CSS generation pipeline
- Remove dead code (`vite-plugin-tokens.ts`)

**Non-Goals:**
- Dark mode support (separate change)
- Component refactoring (e.g., migrating hardcoded `rounded-2xl` to token-based classes)
- Figma Variables sync automation
- Adding missing Figma components to code (Toast, Fill, etc.)

## Decisions

### D1: Remove `headingUtilities` block, keep `tokenUtilities` only

**Rationale**: `tokenUtilities` already generates all typography utilities including headings. The separate `headingUtilities` block at `css-generator.ts:61-65` applies an identity classNameMapper (`heading-1` → `heading-1`) and a default cssGenerator — it's 100% redundant. Removing it is simpler and less error-prone than adding an exclusion filter to `tokenUtilities`.

**Alternative considered**: Add `!key.startsWith("heading-")` filter to `tokenUtilities` and keep `headingUtilities` as the sole heading generator. Rejected — more code, same result, harder to understand.

### D2: Fix typography values by replacing with exact Figma px-to-rem conversions

**Rationale**: The code uses inconsistent rounding (1.1rem instead of 1.125rem for 18px). We'll use exact conversions: `px / 16 = rem`, rounded to 4 decimal places max. This eliminates all ambiguity.

Conversion table:
- 18px = 1.125rem (not 1.1rem)
- 20px = 1.25rem (not 1.3rem)
- 21px = 1.3125rem (not 1.5rem)
- 12px = 0.75rem
- 17px = 1.0625rem

### D3: Restructure `radii.ts` to match Figma and emit via CSS generator

**Rationale**: Figma defines two radii: "Padrao" (16px = 1rem) and "Pill" (100%). The code has `default` and `lg` — `lg` doesn't exist in Figma. We'll align with Figma: `default` (1rem) and `pill` (9999px — CSS standard for pill shapes, more reliable than 100% on non-square elements).

The commented-out code in `css-generator.ts` will be uncommented and updated. The output will be `--radius-default` and `--radius-pill` CSS custom properties.

### D4: Add blur as a new token file integrated into the pipeline

**Rationale**: Figma defines `filter: blur(10px)`. Rather than adding blur to an existing token file, we'll keep the single-responsibility pattern: one file per token category. A new `blur.ts` is not necessary — we'll add blur to a `filters.ts` or simply extend `shadow.ts` to `effects.ts`. Given there's only one blur value, the simplest approach is adding it directly to `css-generator.ts` as a custom property, or adding a `blur` key to `shadow.ts` since both are visual effects.

**Decision**: Add blur to `shadow.ts` (rename conceptually to "visual effects" via comment, keep filename for minimal churn). It will emit `--blur-default: 10px` in the `@theme` block.

### D5: Keep `heading-5` in code despite not being in Figma

**Rationale**: `heading-5` (1rem, 600 weight) fills a real gap between heading-4 (1.125rem, 700) and body-normal-bold (1rem, 700). It may already be in use. Removing it risks breaking existing pages. If it's not in Figma, that's a Figma gap — the code can be the source for this one.

## Risks / Trade-offs

- **[Visual regression]** → Correcting typography values (e.g., body-large from 1.1rem to 1.125rem) will subtly shift text sizing across the app. Mitigation: changes are small (0.4px max) and move toward the intended design.
- **[Unused orange-5 class]** → Adding `orange-5` is safe — it's additive. No existing code will break. Risk is near zero.
- **[Radii enabling]** → Emitting `--radius-default` and `--radius-pill` to CSS doesn't break anything since no component currently references these variables. Components still use hardcoded classes. Migration to token-based classes is a non-goal for this change.
- **[theme.css diff noise]** → Removing duplicate headings and reordering will produce a large diff in the generated file. Mitigation: `theme.css` is a generated artifact, not hand-edited — the diff is expected.
