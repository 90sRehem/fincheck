import swc from "unplugin-swc";
import tsConfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		include: ["**/*.e2e-spec.ts"],
		exclude: ["data", "dist", "node_modules"],
		globals: true,
		root: "./",
		setupFiles: ["./test/setup.e2e.ts"],
	},
	plugins: [
		tsConfigPaths() as any,
		swc.vite({
			module: { type: "es6" },
		}) as any,
	],
});
