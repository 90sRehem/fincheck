# Design System CSS Generator Bugs

## Context

During the Figma-vs-code token audit, several bugs were found in the token pipeline (`packages/design-system/src/tokens/`). These are code-side issues independent of Figma — they produce incorrect CSS output regardless of whether Figma values are correct.

## Findings

### Bug 1: Heading Utilities Generated Twice

**Severity**: Medium (produces duplicate CSS, no visual breakage but doubles size)

`css-generator.ts:53-69` generates two sets of heading utilities:

1. `tokenUtilities` (line 53-59): Filters all typography tokens that have `fontSize` — this **includes** heading-1 through heading-5
2. `headingUtilities` (line 61-65): Filters tokens starting with `heading-` — generates heading-1 through heading-5 **again**

Both are concatenated at line 67-68. Result: `theme.css` contains heading-1 through heading-5 twice (lines 156-280 and 282-315).

**Root cause**: The `tokenUtilities` filter (`key !== "fontFamily" && typeof value === "object" && "fontSize" in value`) does not exclude headings. It catches everything including headings. Then `headingUtilities` catches headings again redundantly.

**Fix**: Either exclude headings from `tokenUtilities` filter, or remove the separate `headingUtilities` generation entirely (since `tokenUtilities` already covers them). The `headingUtilities` block also has a `classNameMapper` that transforms `heading-1` → `heading-1` (identity transform), making it truly redundant.

### Bug 2: input-helper lineHeight and letterSpacing Swapped

**Severity**: High (produces unreadable text — 17px letter-spacing)

In `typography.ts:89-94`:
```typescript
"input-helper": {
    fontSize: "0.75rem",
    fontWeight: 400,
    lineHeight: "0.75rem",      // Should be 1.063rem (from Figma: 17px)
    letterSpacing: "1.063rem",  // Should be 0rem (from Figma: 0px)
}
```

The Figma spec says: fontSize=12px, fontWeight=400, lineHeight=17px (~1.063rem), letterSpacing=0px.

The `1.063rem` value (which is the correct lineHeight) was placed in the `letterSpacing` field. The `lineHeight` got an incorrect `0.75rem` (which equals the fontSize — likely a copy-paste from `input-label-small` above it).

### Bug 3: orange-5 Missing from Color Palette

**Severity**: Medium (any usage of `bg-orange-5` or `text-orange-5` resolves to nothing)

In `colors.ts:146-156`, the orange palette jumps from shade 4 to shade 6:
```typescript
orange: {
    0: "#fff4e6",
    1: "#ffe8cc",
    2: "#ffd8a8",
    3: "#ffc078",
    4: "#ffa94d",
    // 5 is MISSING — Figma defines #FF922B
    6: "#fd7e14",
    ...
}
```

Figma Styleguide clearly defines Orange-5 as `#FF922B`.

### Bug 4: radii.ts Defined but Never Emitted to CSS

**Severity**: Medium (border radius tokens exist but are invisible to Tailwind)

`radii.ts` defines two tokens:
```typescript
export const radii = {
    default: "1rem",
    lg: "1.5rem",
} as const;
```

But in `css-generator.ts:20-22` and `:46-51`, the code that would generate CSS variables and utilities from these tokens is **commented out**. The import of `radii` was also removed (line 1-4 only import colors, typography, spacing, shadow).

Components work around this by hardcoding values like `rounded-2xl` directly in class strings (e.g., `button.tsx:7`).

Additionally, Figma defines a "Pill" radius of `100%` that doesn't exist in `radii.ts` at all.

### Non-bug: vite-plugin-tokens.ts is Dead Code

**Severity**: Low (no runtime impact, just confusing)

`packages/design-system/src/tokens/vite-plugin-tokens.ts` exists but is never used. The dev workflow uses `nodemon` to watch token files and rebuild, not a Vite plugin. This file is orphan code that should be removed.

## Decisions / Open Questions

- Decision: All 4 bugs should be fixed before any new feature work on the design system
- Open: Should `radii.ts` be uncommented as-is, or redesigned to match Figma (default + pill)?
- Open: Should components be migrated from hardcoded `rounded-2xl` to token-based `rounded-default`?

## References

- `packages/design-system/src/tokens/css-generator.ts:53-69` — duplicate heading generation
- `packages/design-system/src/tokens/typography.ts:89-94` — input-helper swapped values
- `packages/design-system/src/tokens/colors.ts:146-156` — missing orange-5
- `packages/design-system/src/tokens/radii.ts` — defined but unused
- `packages/design-system/src/tokens/css-generator.ts:20-22,46-51` — commented-out radii code
- `packages/design-system/src/tokens/theme.css:156-315` — duplicate heading utilities in output
