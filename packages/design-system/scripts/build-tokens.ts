import { writeFileSync } from "fs";
import { generateTailwindTheme } from "../src/tokens/css-generator";

const cssContent = generateTailwindTheme();
writeFileSync("./src/tokens/theme.css", cssContent);

console.log("✅ Design tokens CSS generated successfully!");
