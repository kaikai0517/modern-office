import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";
import viteCompression from "vite-plugin-compression";

// https://vitejs.dev/config/
export default defineConfig({
	build: {
		chunkSizeWarningLimit: 500,
		minify: "terser",
		cssCodeSplit: true,
		terserOptions: {
			compress: {
				drop_console: true,
			},
			output: {
				comments: true,
			},
		},
		rollupOptions: {
			output: {
				manualChunks: {
					vue: ["vue", "vue-router"],
					naiveUI: ["naive-ui"],
				},
			},
		},
	},
	plugins: [
		vue(),
		AutoImport({
			imports: ["vue", "vue-router"],
			// 可以选择auto-import.d.ts生成的位置，
			dts: "src/auto-import.d.ts",
		}),
		viteCompression({
			verbose: true,
			disable: false,
			threshold: 1,
			algorithm: "gzip",
			ext: ".gz",
		}),
	],
	server: {
		host: "0.0.0.0",
	},
});
