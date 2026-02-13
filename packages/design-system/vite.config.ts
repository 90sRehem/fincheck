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
      entry: {
        index: path.resolve(__dirname, "src/index.ts"),
        "icons/expense": path.resolve(
          __dirname,
          "src/components/ui/icons/expense.ts",
        ),
        "icons/revenue": path.resolve(
          __dirname,
          "src/components/ui/icons/revenue.ts",
        ),
        "icons/account": path.resolve(
          __dirname,
          "src/components/ui/icons/account.ts",
        ),
        "icons/general": path.resolve(
          __dirname,
          "src/components/ui/icons/general.ts",
        ),
        "icons/colors": path.resolve(
          __dirname,
          "src/components/ui/icons/colors.ts",
        ),
      },
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
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === "index") return "[name].[format].js";
          return "[name].[format].js";
        },
      },
    },
    cssCodeSplit: false,
  },
});
