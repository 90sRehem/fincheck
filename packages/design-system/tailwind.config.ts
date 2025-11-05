import type { Config } from "tailwindcss";
import { tokens } from "./src/tokens";

export default {
	content: ["./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			colors: tokens.colors,
			fontFamily: tokens.typography.fontFamily,
			fontSize: tokens.typography.fontSize,
			fontWeight: tokens.typography.fontWeight,
			lineHeight: tokens.typography.lineHeight,
			spacing: tokens.spacing,
		},
	},
	plugins: [],
} satisfies Config;
