import { colors } from "./colors";
import { typography } from "./typography";
import { spacing } from "./spacing";
import { shadow } from "./shadow";

export function generateTailwindTheme() {
  const colorTheme = Object.entries(colors).reduce(
    (acc, [colorName, shades]) => {
      const shadeTheme = Object.entries(shades).reduce(
        (shadeAcc, [shade, value]) => {
          return shadeAcc + `  --color-${colorName}-${shade}: ${value};\n`;
        },
        "",
      );
      return acc + shadeTheme;
    },
    "",
  );

  const spacingTheme = Object.entries(spacing).reduce((acc, [key, value]) => {
    return acc + `  --spacing-${key}: ${value};\n`;
  }, "");

  const fontTheme = Object.entries(typography.fontFamily).reduce(
    (acc, [name, fonts]) => {
      const fontValue = Array.isArray(fonts) ? fonts.join(", ") : fonts;
      return acc + `  --font-family-${name}: ${fontValue};\n`;
    },
    "",
  );

  const shadowTheme = Object.entries(shadow).reduce((acc, [key, value]) => {
    return acc + `  --shadow-${key}: ${value};\n`;
  }, "");

  const themeSection = `@theme {
${colorTheme}
${spacingTheme}
${fontTheme}
${shadowTheme}}`;

  const tokenUtilities = generateUtilitiesFromTokens(typography, {
    filter: (key, value) =>
      key !== "fontFamily" &&
      typeof value === "object" &&
      value !== null &&
      "fontSize" in value,
  });

  const headingUtilities = generateUtilitiesFromTokens(typography, {
    filter: (key) => key.startsWith("heading-"),
    classNameMapper: (key) => `h${key.split("-")[1]}`,
    cssGenerator: (token) => generateTokenCSS(token),
  });

  const typographyUtilities = [tokenUtilities, headingUtilities]
    .filter(Boolean)
    .join("\n\n");

  return `${themeSection}

${typographyUtilities}`;
}

export function getCSSCustomProperty(tokenPath: string) {
  return `var(--${tokenPath})`;
}

function generateTokenCSS(
  token: Record<string, any>,
  exclude: string[] = [],
): string {
  return Object.entries(token).reduce((acc, [prop, value]) => {
    if (exclude.includes(prop)) return acc;

    const cssProp = prop.replace(/([A-Z])/g, "-$1").toLowerCase();
    const cssDeclaration = `  ${cssProp}: ${value};`;
    return acc + (acc ? "\n" : "") + cssDeclaration;
  }, "");
}

function generateUtilitiesFromTokens<T extends Record<string, any>>(
  tokens: T,
  options: {
    filter?: (key: string, value: any) => boolean;
    classNameMapper?: (key: string) => string;
    cssGenerator?: (token: any) => string;
  } = {},
): string {
  const {
    filter = () => true,
    classNameMapper = (key) => key,
    cssGenerator = generateTokenCSS,
  } = options;

  return Object.entries(tokens).reduce((acc, [key, token]) => {
    if (!filter(key, token)) return acc;

    const className = classNameMapper(key);
    const cssContent = cssGenerator(token);
    const utility = `@utility ${className} {\n${cssContent}\n}`;
    return acc + (acc ? "\n\n" : "") + utility;
  }, "");
}
