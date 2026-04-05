## Why

The design system tokens in code have drifted from the Figma source of truth. A Figma-vs-code audit revealed 4 bugs in the token pipeline (swapped values, missing color, duplicate CSS output, disabled radii), plus 10 typography values that diverge from Figma specs. These issues produce incorrect CSS — most critically, `input-helper` renders with 17px letter-spacing (unreadable text), and `bg-orange-5` resolves to nothing. Fixing these now prevents the drift from compounding as new components are built.

## What Changes

- **Fix `input-helper` typography**: Swap `lineHeight` and `letterSpacing` values back to match Figma (lh=1.063rem, ls=0rem)
- **Fix `input-label` typography**: Correct lineHeight from 1.25rem to 0.75rem and letterSpacing from 0.025rem to 0rem to match Figma
- **Add `orange-5`**: Insert missing shade `#FF922B` in the color palette
- **Fix `gray-6`**: Correct hex from `#868b96` to `#868E96` to match Figma
- **Fix duplicate heading CSS**: Remove redundant `headingUtilities` generation in `css-generator.ts` — `tokenUtilities` already covers headings
- **Sync all typography values with Figma**: Correct fontSize for heading-3 (1.25rem), heading-4 (1.125rem), body-large-* (1.125rem); correct lineHeight for body-small-regular (1.3125rem), button-small (1.25rem)
- **Enable radii tokens**: Uncomment radii in `css-generator.ts`, update `radii.ts` to match Figma (default=1rem, pill=9999px), add blur token (10px)
- **Remove dead code**: Delete unused `vite-plugin-tokens.ts`

## Capabilities

### New Capabilities

- `token-sync`: Establishes the corrected token values and ensures the CSS generator pipeline produces accurate, non-duplicate output aligned with Figma

### Modified Capabilities

_(none — no existing specs)_

## Impact

- **Affected package**: `packages/design-system` only
- **Files changed**: `colors.ts`, `typography.ts`, `radii.ts`, `css-generator.ts`, `shadow.ts` (add blur alongside), `theme.css` (regenerated)
- **Downstream effect**: `theme.css` regeneration changes CSS custom properties and utility classes. Any component using `bg-orange-5`, `input-helper`, `input-label`, or hardcoded `rounded-2xl` may render differently — visually closer to the Figma spec
- **No API changes**: Component props and exports unchanged
- **No breaking changes**: All fixes bring code closer to Figma — no intentional behavior is removed

## Success Criteria

- All 140 color hex values in `colors.ts` match Figma Styleguide exactly (including orange-5 and gray-6)
- All typography tokens in `typography.ts` match Figma values (px converted to rem at base 16px)
- `theme.css` contains zero duplicate `@utility` blocks
- `radii.ts` tokens are emitted to `theme.css` as CSS custom properties
- Blur token (10px) is defined and emitted
- `vite-plugin-tokens.ts` is deleted
- `turbo check-types` passes with no new errors
- `bun run build` in design-system succeeds

## Technical Constraints

- `theme.css` is a generated file — changes must go through the token pipeline (edit `.ts` sources, not the CSS directly)
- Tailwind v4 uses `@theme` and `@utility` directives — generated CSS must conform to this syntax
- The `bun run build:tokens` script must be re-run after token changes to regenerate `theme.css`
