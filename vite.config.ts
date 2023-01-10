import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		vue(),

		AutoImport({
			imports: ["vue", "vue-router", "vue-i18n"],
			// 可以选择auto-import.d.ts生成的位置，
			dts: "src/auto-import.d.ts",
		}),
	],
	server: {
		host: "0.0.0.0",
	},
});
