import { watch } from "node:fs";
import { execSync } from "node:child_process";
import { resolve } from "node:path";

const TOKENS_DIR = resolve(__dirname, "../src/tokens");
const THEME_CSS = resolve(__dirname, "../src/tokens/theme.css");

console.log("🔍 Watching tokens directory for changes...");

// Função para regenerar tokens
function regenerateTokens() {
	try {
		console.log("🔄 Regenerating tokens...");
		execSync("npm run build:tokens", { stdio: "inherit" });
		console.log("✅ Tokens regenerated successfully!");
	} catch (error) {
		console.error("❌ Error regenerating tokens:", error);
	}
}

// Gera tokens inicialmente
regenerateTokens();

// Watch da pasta tokens
watch(TOKENS_DIR, { recursive: true }, (_, filename) => {
	if (!filename) return;

	const filePath = resolve(TOKENS_DIR, filename);

	// Ignora theme.css para evitar loops
	if (filePath === THEME_CSS) return;

	// Só processa arquivos .ts
	if (!filename.endsWith(".ts")) return;

	console.log(`📝 File changed: ${filename}`);
	regenerateTokens();
});

// Mantém o processo vivo
process.on("SIGINT", () => {
	console.log("\n👋 Stopping tokens watcher...");
	process.exit(0);
});
