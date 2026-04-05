## 1. Fix Color Tokens

- [ ] 1.1 [design-system/tokens] Add missing `orange-5: "#FF922B"` to `colors.ts:151` (between shade 4 and 6). Verify all 14 palettes have exactly 10 shades (0-9).
- [ ] 1.2 [design-system/tokens] Fix `gray-6` from `"#868b96"` to `"#868E96"` in `colors.ts:9`.

## 2. Fix Typography Tokens

- [ ] 2.1 [design-system/tokens] Fix `input-helper` in `typography.ts:89-94`: set `lineHeight: "1.0625rem"` and `letterSpacing: "0rem"` (currently swapped).
- [ ] 2.2 [design-system/tokens] Fix `input-label` in `typography.ts:71-76`: set `lineHeight: "0.75rem"` and `letterSpacing: "0rem"` (currently lh=1.25rem, ls=0.025rem).
- [ ] 2.3 [design-system/tokens] Fix `heading-3` fontSize from `"1.3rem"` to `"1.25rem"` in `typography.ts:18`.
- [ ] 2.4 [design-system/tokens] Fix `heading-4` fontSize from `"1.1rem"` to `"1.125rem"` in `typography.ts:24`.
- [ ] 2.5 [design-system/tokens] Fix `body-large-bold`, `body-large-medium`, `body-large-regular` fontSize from `"1.1rem"` to `"1.125rem"` in `typography.ts:30,36,42`.
- [ ] 2.6 [design-system/tokens] Fix `body-small-regular` lineHeight from `"1.5rem"` to `"1.3125rem"` in `typography.ts:68`.
- [ ] 2.7 [design-system/tokens] Fix `button-small` lineHeight from `"1.125rem"` to `"1.25rem"` in `typography.ts:104`.

## 3. Fix CSS Generator

- [ ] 3.1 [design-system/tokens] Remove the redundant `headingUtilities` block in `css-generator.ts:61-65`. Keep only `tokenUtilities` (line 53-59) which already generates all typography utilities including headings. Update the `typographyUtilities` concatenation at line 67-68 accordingly.
- [ ] 3.2 [design-system/tokens] Enable radii token generation in `css-generator.ts`: uncomment the `radii` import (add to line 1-4), uncomment `roundedTheme` generation (lines 20-22), and uncomment `roundedUtilities` generation (lines 46-51). Add `roundedTheme` to the `@theme` template string (line 40-44).
- [ ] 3.3 [design-system/tokens] Add blur token emission to `css-generator.ts`: add a `--blur-default: 10px` line to the `@theme` block. This can be added to the `shadowTheme` generation or as a standalone line in the template.

## 4. Update Radii Tokens

- [ ] 4.1 [design-system/tokens] Update `radii.ts` to match Figma: change `lg: "1.5rem"` to `pill: "9999px"`. Keep `default: "1rem"`. Final shape: `{ default: "1rem", pill: "9999px" }`.

## 5. Add Blur Token

- [ ] 5.1 [design-system/tokens] Add `blur` entry to `shadow.ts`: `blur: "10px"`. This pairs the blur value alongside the shadow effect token.

## 6. Clean Up Dead Code

- [ ] 6.1 [design-system/tokens] Delete `vite-plugin-tokens.ts` from `packages/design-system/src/tokens/`.

## 7. Regenerate and Verify

- [ ] 7.1 [design-system] Run `bun run build:tokens` to regenerate `theme.css`. Verify: no duplicate `@utility` blocks, `--color-orange-5` present, `--radius-default` and `--radius-pill` present, `--blur-default` present.
- [ ] 7.2 [design-system] Run `bun run build` to confirm library build succeeds with no errors.
- [ ] 7.3 [monorepo] Run `turbo check-types` to confirm no type errors across the entire monorepo.
- [ ] 7.4 [monorepo] Run `bun run lint` to confirm Biome passes with no new issues.
