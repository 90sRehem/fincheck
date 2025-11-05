import type { Plugin } from "vite";
import { writeFileSync } from "fs";
import { generateTailwindTheme } from "../src/tokens/css-generator";

export function tokensPlugin(): Plugin {
	return {
		name: "tokens-generator",
		buildStart() {
			// Gera tokens no início do build
			const cssContent = generateTailwindTheme();
			writeFileSync("./src/tokens/theme.css", cssContent);
			console.log("✅ Tokens CSS regenerated!");
		},
		handleHotUpdate({ file, server }) {
			// Regenera tokens quando arquivos de token mudam
			if (
				file.includes("/tokens/") &&
				file.endsWith(".ts") &&
				!file.includes("theme.css")
			) {
				const cssContent = generateTailwindTheme();
				writeFileSync("./src/tokens/theme.css", cssContent);
				console.log("✅ Tokens CSS updated!");

				// Força reload do CSS
				server.ws.send({
					type: "full-reload",
				});
			}
		},
	};
}
