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
		// Removido handleHotUpdate para evitar loop infinito
		// Para dev: use `npm run build:tokens` em watch mode em terminal separado
	};
}

			// Regenera tokens apenas para arquivos .ts na pasta tokens
			if (
				normalizedFile.includes("/tokens/") &&
				normalizedFile.endsWith(".ts")
			) {
				isGenerating = true;

				try {
					const newCssContent = generateTailwindTheme();

					// Verifica se o conteúdo realmente mudou
					let currentContent = "";
					try {
						currentContent = readFileSync("./src/tokens/theme.css", "utf-8");
					} catch {
						// Arquivo não existe, pode escrever
					}

					if (newCssContent !== currentContent) {
						writeFileSync("./src/tokens/theme.css", newCssContent);
						console.log("✅ Tokens CSS updated!");

						// Envia update específico para o CSS
						server.ws.send({
							type: "update",
							updates: [
								{
									type: "css-update",
									path: "/src/tokens/theme.css",
									acceptedPath: "/src/tokens/theme.css",
									timestamp: Date.now(),
								},
							],
						});
					}
				} finally {
					// Libera o lock após um pequeno delay
					setTimeout(() => {
						isGenerating = false;
					}, 100);
				}
			}
		},
	};
}
