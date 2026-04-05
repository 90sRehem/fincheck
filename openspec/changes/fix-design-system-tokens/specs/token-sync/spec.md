## ADDED Requirements

### Requirement: Color palette matches Figma exactly

The color token source (`colors.ts`) SHALL contain all 14 palettes with exactly 10 shades each (0-9), and every hex value SHALL match the Figma Styleguide.

#### Scenario: orange-5 exists with correct value
- **WHEN** the color palette is inspected
- **THEN** `orange.5` SHALL equal `"#FF922B"`

#### Scenario: gray-6 matches Figma
- **WHEN** the color palette is inspected
- **THEN** `gray.6` SHALL equal `"#868E96"` (not `#868b96`)

#### Scenario: All 140 colors are present
- **WHEN** the color palette is inspected
- **THEN** every palette (gray, red, pink, grape, violet, indigo, blue, cyan, teal, green, lime, yellow, orange) SHALL have shades 0 through 9 with no gaps

### Requirement: Typography tokens match Figma values

All typography tokens in `typography.ts` SHALL use exact px-to-rem conversions from the Figma Styleguide (base 16px).

#### Scenario: heading-3 fontSize is correct
- **WHEN** `heading-3` token is inspected
- **THEN** `fontSize` SHALL be `"1.25rem"` (Figma: 20px)

#### Scenario: heading-4 fontSize is correct
- **WHEN** `heading-4` token is inspected
- **THEN** `fontSize` SHALL be `"1.125rem"` (Figma: 18px)

#### Scenario: body-large variants fontSize is correct
- **WHEN** `body-large-bold`, `body-large-medium`, or `body-large-regular` tokens are inspected
- **THEN** `fontSize` SHALL be `"1.125rem"` (Figma: 18px)

#### Scenario: body-small-regular lineHeight is correct
- **WHEN** `body-small-regular` token is inspected
- **THEN** `lineHeight` SHALL be `"1.3125rem"` (Figma: 21px)

#### Scenario: input-helper values are not swapped
- **WHEN** `input-helper` token is inspected
- **THEN** `lineHeight` SHALL be `"1.0625rem"` (Figma: 17px) and `letterSpacing` SHALL be `"0rem"` (Figma: 0px)

#### Scenario: input-label matches Figma
- **WHEN** `input-label` token is inspected
- **THEN** `lineHeight` SHALL be `"0.75rem"` (Figma: 12px) and `letterSpacing` SHALL be `"0rem"` (Figma: 0px)

#### Scenario: button-small lineHeight is correct
- **WHEN** `button-small` token is inspected
- **THEN** `lineHeight` SHALL be `"1.25rem"` (Figma: 20px)

### Requirement: CSS generator produces no duplicate utilities

The `css-generator.ts` SHALL generate each `@utility` block exactly once in `theme.css`.

#### Scenario: heading utilities appear once
- **WHEN** `theme.css` is generated via `bun run build:tokens`
- **THEN** `@utility heading-1`, `@utility heading-2`, `@utility heading-3`, `@utility heading-4`, and `@utility heading-5` SHALL each appear exactly once in the output

### Requirement: Radii tokens are emitted to CSS

The `radii.ts` tokens SHALL be imported by `css-generator.ts` and emitted as CSS custom properties in the `@theme` block of `theme.css`.

#### Scenario: Default radius is emitted
- **WHEN** `theme.css` is generated
- **THEN** the output SHALL contain `--radius-default: 1rem`

#### Scenario: Pill radius is emitted
- **WHEN** `theme.css` is generated
- **THEN** the output SHALL contain `--radius-pill: 9999px`

### Requirement: Blur token exists and is emitted to CSS

A blur token SHALL be defined and emitted as a CSS custom property.

#### Scenario: Blur token is in theme.css
- **WHEN** `theme.css` is generated
- **THEN** the output SHALL contain `--blur-default: 10px`

### Requirement: No dead code in token pipeline

Unused files in the token directory SHALL be removed.

#### Scenario: vite-plugin-tokens.ts is deleted
- **WHEN** the tokens directory is inspected
- **THEN** `vite-plugin-tokens.ts` SHALL NOT exist
