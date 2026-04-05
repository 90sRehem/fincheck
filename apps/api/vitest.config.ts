import swc from "unplugin-swc";
import tsConfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		globals: true,
		root: "./",
		exclude: ["data", "dist", "node_modules"],
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html"],
			enabled: true,
		},
	},
	plugins: [
		tsConfigPaths(),
		swc.vite({
			module: { type: "es6" },
		}) as any,
	],
});
