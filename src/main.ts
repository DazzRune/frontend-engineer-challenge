import { createApp } from 'vue'
import './assets/main.css'

import App from './App.vue'
import router from './router'

prepareApp().then(() => {
	const app = createApp(App)

	app.use(router)

	app.mount('#app')
})

async function prepareApp() {
	// Условие: включаем моки в разработке ИЛИ если есть флаг в переменной окружения
	if (import.meta.env.DEV || import.meta.env.VITE_MOCK_API === 'true') {
		const { worker } = await import('./mocks/browser')
		// Начинаем перехват запросов
		// return worker.start({
		// 	onUnhandledRequest: 'bypass', // Не ругаться на реальные запросы (картинки, шрифты)
		// })
		return worker.start({
			serviceWorker: {
				url: `${import.meta.env.BASE_URL}mockServiceWorker.js`,
			},
			onUnhandledRequest(request, print) {
				const url = new URL(request.url)
				// Ignore navigation and same-origin asset requests
				if (url.origin === location.origin) return
				print.warning()
			},
		})
	}
}
