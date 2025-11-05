import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		react(),
		tailwindcss(),
		dts({
			include: ["src/**/*"],
			exclude: ["src/**/*.test.*", "src/**/*.spec.*", "scripts/**/*"],
			insertTypesEntry: true,
			tsconfigPath: "./tsconfig.app.json",
			compilerOptions: {
				declaration: true,
				emitDeclarationOnly: true,
				skipLibCheck: true,
			},
		}),
	],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
	build: {
		lib: {
			entry: path.resolve(__dirname, "src/index.ts"),
			name: "FincheckDesignSystem",
			fileName: "index",
			formats: ["es", "cjs"],
		},
		rollupOptions: {
			external: ["react", "react-dom"],
			output: {
				globals: {
					react: "React",
					"react-dom": "ReactDOM",
				},
				assetFileNames: (assetInfo) => {
					if (assetInfo.name === "index.css") return "styles.css";
					return assetInfo.name || "asset";
				},
			},
		},
		cssCodeSplit: false,
	},
});
