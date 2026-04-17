/// <reference types="vite/client" />

declare module "*.svg" {
	const content: string;
	// biome-ignore lint/style/noDefaultExport: <explanation>
	export default content;
}

interface ImportMetaEnv {
	readonly VITE_API_URL: string;
}
interface ImportMeta {
	readonly env: ImportMetaEnv;
}

