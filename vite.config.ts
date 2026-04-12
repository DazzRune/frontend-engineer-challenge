import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
	base: `/api/v1/auth/`,
	plugins: [
		vue(),
		// vueDevTools(),
		AutoImport({
			imports: [
				'vue',
				'vue-router',
				'@vueuse/core',
			],
			dts: 'src/auto-imports.d.ts', // генерирует TS типы для подсказки редактору
			vueTemplate: true,
		}),
		Components({
			dts: 'src/components.d.ts',
			dirs: ['src/components', 'src/pages', 'src/layouts', 'src/assets/svg'],
		}),
		tailwindcss(),
	],
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url)),
		},
	},
})
