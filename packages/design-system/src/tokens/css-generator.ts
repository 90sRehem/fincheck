import { colors } from "./colors";
import { typography } from "./typography";
import { spacing } from "./spacing";
import { shadow } from "./shadow";

type TypographyStyles = Omit<typeof typography, "fontFamily">;
type TypographyStyleNames = keyof TypographyStyles;

export function generateTailwindTheme() {
  const colorVars = Object.entries(colors)
    .map(([colorName, shades]) =>
      Object.entries(shades)
        .map(([shade, value]) => `  --color-${colorName}-${shade}: ${value};`)
        .join("\n"),
    )
    .join("\n\n");

  const fontVars = Object.entries(typography.fontFamily)
    .map(
      ([name, fonts]) =>
        `  --font-${name}: ${Array.isArray(fonts) ? fonts.join(", ") : fonts};`,
    )
    .join("\n");

  const typographyVars = Object.entries(typography)
    .filter(([key]) => key !== "fontFamily")
    .map(([styleName, styleProps]) => {
      return Object.entries(styleProps)
        .map(
          ([prop, value]) => `  --typography-${styleName}-${prop}: ${value};`,
        )
        .join("\n");
    })
    .join("\n");

  const spacingVars = Object.entries(spacing)
    .map(([key, value]) => `  --spacing-${key}: ${value};`)
    .join("\n");

  const shadowVars = Object.entries(shadow)
    .map(([key, value]) => `  --shadow-${key}: ${value};`)
    .join("\n");

  const colorUtilities = Object.entries(colors)
    .map(([colorName, shades]) => generateColorUtilities(colorName, shades))
    .join("\n\n");

  const typographyUtilities = generateTypographyUtilities();
  const spacingUtilities = generateSpacingUtilities();
  const shadowUtilities = generateShadowUtilities();

  return `:root {
      ${fontVars}

      ${colorVars}

      ${typographyVars}

      ${spacingVars}

      ${shadowVars}
    }

/* Custom utility classes */
${colorUtilities}

/* Typography utility classes */
${typographyUtilities}

/* Spacing utility classes */
${spacingUtilities}

/* Shadow utility classes */
${shadowUtilities}`;
}

function generateColorUtilities(
  colorName: string,
  shades: Record<string, string>,
) {
  return Object.entries(shades)
    .map(([shade, _value]) => {
      const colorVar = `var(--color-${colorName}-${shade})`;
      return [
        `.bg-${colorName}-${shade} { background-color: ${colorVar}; }`,
        `.text-${colorName}-${shade} { color: ${colorVar}; }`,
        `.border-${colorName}-${shade} { border-color: ${colorVar}; }`,
        `.fill-${colorName}-${shade} { fill: ${colorVar}; }`,
        `.stroke-${colorName}-${shade} { stroke: ${colorVar}; }`,
      ].join("\n");
    })
    .join("\n");
}

function generateTypographyUtilities() {
  const exactTokenUtilities = generateTokenUtilities();
  const headingUtilities = generateHeadingUtilities();
  const semanticUtilities = generateSemanticMappings();

  return [exactTokenUtilities, headingUtilities, semanticUtilities].join(
    "\n\n",
  );
}

function generateTokenUtilities() {
  const allTokenKeys: TypographyStyleNames[] = [
    "heading-1",
    "heading-2",
    "heading-3",
    "heading-4",
    "body-large-bold",
    "body-large-medium",
    "body-large-regular",
    "body-normal-bold",
    "body-normal-medium",
    "body-normal-regular",
    "body-small-regular",
    "input-label",
    "input-label-small",
    "input-placeholder",
    "input-helper",
    "button-large",
    "button-small",
  ];

  return allTokenKeys
    .map((tokenKey) => {
      const baseVar = `--typography-${tokenKey}`;
      return `@utility ${tokenKey} {
  font-size: var(${baseVar}-fontSize);
  font-weight: var(${baseVar}-fontWeight);
  line-height: var(${baseVar}-lineHeight);
  letter-spacing: var(${baseVar}-letterSpacing);
}`;
    })
    .join("\n\n");
}

function generateHeadingUtilities() {
  const headingMappings: Record<string, string> = {
    "heading-1": "h1",
    "heading-2": "h2",
    "heading-3": "h3",
    "heading-4": "h4",
  };

  return Object.entries(headingMappings)
    .map(([tokenKey, semanticClass]) => {
      const baseVar = `--typography-${tokenKey}`;
      return `@utility ${semanticClass} {
  font-size: var(${baseVar}-fontSize);
  font-weight: var(${baseVar}-fontWeight);
  line-height: var(${baseVar}-lineHeight);
  letter-spacing: var(${baseVar}-letterSpacing);
}`;
    })
    .join("\n\n");
}

function generateSemanticMappings() {
  const tailwindMappings: Record<string, string> = {
    "heading-1": "text-2xl",
    "heading-2": "text-xl",
    "heading-3": "text-lg",
    "heading-4": "text-base",
  };

  return Object.entries(tailwindMappings)
    .map(([tokenKey, tailwindClass]) => {
      const baseVar = `--typography-${tokenKey}`;
      return `@utility ${tailwindClass} {
  font-size: var(${baseVar}-fontSize);
}`;
    })
    .join("\n\n");
}

function generateSpacingUtilities() {
  return Object.entries(spacing)
    .map(([key, _value]) => {
      const spacingVar = `var(--spacing-${key})`;
      return [
        `.m-${key} { margin: ${spacingVar}; }`,
        `.mt-${key} { margin-top: ${spacingVar}; }`,
        `.mr-${key} { margin-right: ${spacingVar}; }`,
        `.mb-${key} { margin-bottom: ${spacingVar}; }`,
        `.ml-${key} { margin-left: ${spacingVar}; }`,
        `.mx-${key} { margin-left: ${spacingVar}; margin-right: ${spacingVar}; }`,
        `.my-${key} { margin-top: ${spacingVar}; margin-bottom: ${spacingVar}; }`,
        `.p-${key} { padding: ${spacingVar}; }`,
        `.pt-${key} { padding-top: ${spacingVar}; }`,
        `.pr-${key} { padding-right: ${spacingVar}; }`,
        `.pb-${key} { padding-bottom: ${spacingVar}; }`,
        `.pl-${key} { padding-left: ${spacingVar}; }`,
        `.px-${key} { padding-left: ${spacingVar}; padding-right: ${spacingVar}; }`,
        `.py-${key} { padding-top: ${spacingVar}; padding-bottom: ${spacingVar}; }`,
        `.gap-${key} { gap: ${spacingVar}; }`,
        `.w-${key} { width: ${spacingVar}; }`,
        `.h-${key} { height: ${spacingVar}; }`,
      ].join("\n");
    })
    .join("\n\n");
}

function generateShadowUtilities() {
  return Object.entries(shadow)
    .map(([key, _value]) => {
      const shadowVar = `var(--shadow-${key})`;
      return `.shadow-${key} { box-shadow: ${shadowVar}; }`;
    })
    .join("\n");
}

export function getCSSCustomProperty(tokenPath: string) {
  return `var(--${tokenPath})`;
}
