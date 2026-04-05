# Design System Token Audit — Figma vs Code

## Context

Compared every design token defined in the Figma Styleguide page (`14:350`) against the code implementation in `packages/design-system/src/tokens/`. The Figma file is `a8ftE9e7at7JQBLCm9wOoj` (Fincheck Copy). Data extracted via Figma REST API.

## Findings

### Colors

14 palettes x 10 shades each. The palette is based on Open Color.

**Match rate: ~99%** — 138 of 140 colors match perfectly (case-insensitive).

Two divergences found:

- **gray-6**: Figma defines `#868E96`, code has `#868b96` (`packages/design-system/src/tokens/colors.ts:9`). The green channel differs: `8E` vs `8b`.
- **orange-5**: Figma defines `#FF922B`, code is **missing entirely** (`packages/design-system/src/tokens/colors.ts:152`). The shade jumps from 4 to 6. This means `bg-orange-5` / `text-orange-5` classes resolve to nothing.

### Typography

Font family confirmed: **DM Sans** on both sides.

Figma defines values in `px`, code uses `rem` (base 16px). The following divergences were found:

| Token | Property | Figma (px) | Figma (rem) | Code (rem) | Status |
|-------|----------|------------|-------------|------------|--------|
| heading-3 | fontSize | 20px | 1.25rem | 1.3rem | DIVERGE (+0.8px) |
| heading-4 | fontSize | 18px | 1.125rem | 1.1rem | DIVERGE (-0.4px) |
| body-large-* | fontSize | 18px | 1.125rem | 1.1rem | DIVERGE (-0.4px) |
| body-small-regular | lineHeight | 21px | 1.3125rem | 1.5rem | DIVERGE (+3px) |
| input-label | lineHeight | 12px | 0.75rem | 1.25rem | DIVERGE (+8px) |
| input-label | letterSpacing | 0px | 0rem | 0.025rem | DIVERGE |
| input-helper | lineHeight | 17px | 1.0625rem | 0.75rem | INVERTED with ls |
| input-helper | letterSpacing | 0px | 0rem | 1.063rem | INVERTED with lh |
| button-small | lineHeight | 20px | 1.225rem | 1.125rem | DIVERGE (-1.6px) |
| heading-5 | (all) | NOT IN FIGMA | — | exists in code | EXTRA |

**Critical bug**: `input-helper` in `packages/design-system/src/tokens/typography.ts:89-94` has `lineHeight` and `letterSpacing` values swapped. The Figma value for lineHeight (1.063rem / 17px) ended up in the `letterSpacing` field, producing 17px letter-spacing (unreadable text).

### Shadow

Single value on both sides. **Perfect match**.

- Figma: `0px 11px 20px rgba(0, 0, 0, 0.1)`
- Code: `0px 11px 20px rgba(0, 0, 0, 0.1)` (`packages/design-system/src/tokens/shadow.ts:2`)

### Border Radius

| Token | Figma | Code (radii.ts) | Status |
|-------|-------|-----------------|--------|
| Padrao | 16px (1rem) | default: "1rem" | MATCH (but not emitted to CSS) |
| Pill | 100% | not defined | MISSING in code |
| lg | not defined | lg: "1.5rem" | EXTRA in code |

**Aggravating factor**: `radii.ts` exists but is **commented out** in `css-generator.ts:20-22` and `:46-51`. No radius tokens reach `theme.css`. Components use hardcoded values like `rounded-2xl`.

### Blur

- Figma defines: `filter: blur(10px)`
- Code: **no blur token exists anywhere** — not in tokens, not in css-generator.

### Spacing

Code defines 18 steps: 0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 56, 64. This follows a Tailwind-like scale. Figma Styleguide page does not document spacing tokens explicitly (they're implicit in component specs). Could not verify alignment without accessing individual component specs.

## Decisions / Open Questions

- Decision: The color palette is Open Color — both sides use it, divergences are transcription errors
- Open: Are the fontSize divergences (1.125rem vs 1.1rem) intentional rounding or bugs? Figma uses exact px values (18px = 1.125rem), code rounds to 1.1rem
- Open: Should `heading-5` be added to Figma or removed from code?
- Open: Should spacing tokens be documented in the Figma Styleguide?

## References

- `packages/design-system/src/tokens/colors.ts` — color palette definitions
- `packages/design-system/src/tokens/typography.ts` — typography token definitions
- `packages/design-system/src/tokens/shadow.ts` — shadow token
- `packages/design-system/src/tokens/radii.ts` — border radius tokens (not emitted)
- `packages/design-system/src/tokens/spacing.ts` — spacing scale
- `packages/design-system/src/tokens/css-generator.ts` — token-to-CSS pipeline
- `packages/design-system/src/tokens/theme.css` — generated CSS output
- Figma Styleguide page: node `14:350` in file `a8ftE9e7at7JQBLCm9wOoj`
