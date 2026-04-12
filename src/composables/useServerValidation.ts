import { STATUS, SCHEMA_PER_PAGE, PAGES, MESSAGE_PER_STATUS, URL_BASE, type TFormPage, URL_ORIGIN } from "@/assets/scripts/constants"
import type { TSchema } from "@/schema"

export function useServerValidation(state: MaybeRefOrGetter<TSchema>, page: MaybeRefOrGetter<TFormPage>) {
	const _state = computed(() => ({ ...toValue(state), token: 'mK9pL2xQvR7nJ4wY8hF3tA6uC1eB5dG0' }))
	const _page = computed(() => toValue(page))
	// const url = computed(() => `${URL_BASE}${_page.value}`)
	// const url = computed(() => `${URL_ORIGIN}${_page.value}`)
	const url = computed(() => import.meta.env.DEV || import.meta.env.VITE_MOCK_API === 'true'
		? `${URL_BASE}${_page.value}`
		: `${URL_ORIGIN}${_page.value}`)

	const validationMessage = ref<Record<keyof TSchema, string> | null>(null) // размещается под полями формы
	const sensitiveMessage = ref<string | null | undefined>(null) // размещается под кнопкой отправки формы

	// сброс сообщения на событие input (это более инкапсулированный, но менее производительный вариант). другой - поместить в метод и предоставить доступ извне
	watch(() => Object.values(_state.value), (v) => {
		validationMessage.value = null
		sensitiveMessage.value = null
	})

	function send() {
		if (canAbort.value) abort(`the request on ${url.value} was aborted because a new one executed`)
		return execute()
	}

	const { data, error, execute, isFetching, canAbort, abort } = useFetch(url,
		// { credentials: 'include' }, // для поддержки разных доменов (в т.ч. порты localhost сервера и клиента обычно разные)
		{
			immediate: false,
			afterFetch(ctx) {
				validationMessage.value = null
				sensitiveMessage.value = null

				console.info(`serverValidation OK:`, ctx.data)

				return ctx
			},
			onFetchError(ctx) {
				// тело запроса доступо и в этом обработчике (ctx.data)
				// message - сообщение в сыром виде, может приходить в разных форматах, может содержаться как в ctx.data так и в ctx.error
				let message = MESSAGE_PER_STATUS[STATUS.INTERNAL_SERVER_ERROR]
				if (ctx.data) {
					if (typeof ctx.data === 'string') message = JSON.parse(ctx.data).message
					else if (typeof ctx.data === 'object') message = ctx.data.message
				} else if (ctx.error) {
					if (typeof ctx.error === 'string') message = JSON.parse(ctx.error).message
					else if (typeof ctx.error === 'object') message = ctx.error.message
				}

				const status = ctx.response?.status

				validationMessage.value = null

				if (status) {
					if (status >= 500) sensitiveMessage.value = message ?? MESSAGE_PER_STATUS[STATUS.INTERNAL_SERVER_ERROR]
					if (status === STATUS.RATE_LIMITED) sensitiveMessage.value = MESSAGE_PER_STATUS[STATUS.RATE_LIMITED]
					if (status === STATUS.SERVICE_UNAVAILABLE) sensitiveMessage.value = MESSAGE_PER_STATUS[STATUS.SERVICE_UNAVAILABLE]
				}

				// ошибку можно кастомизировать (ctx.error)
				if (_page.value === PAGES.login) {
					if (status === STATUS.BAD_REQUEST) {
						validationMessage.value = { email: [''], password: [message] }
					} else if (status === STATUS.NOT_FOUND) {
						validationMessage.value = { email: [message] }
					} else if (status === STATUS.INVALID_CREDENTIALS) {
						validationMessage.value = { email: [''], password: [message] }
					}

				} else if (_page.value === PAGES.register) {
					if (status === STATUS.BAD_REQUEST) {
						validationMessage.value = { email: [message] }
					} else if (status === STATUS.ALREADY_EXISTS) {
						validationMessage.value = { email: [message] }
					}

				} else if (_page.value === PAGES.reset) {
					if (status === STATUS.BAD_REQUEST) {
						validationMessage.value = { email: [message] }
					} else if (status === STATUS.NOT_FOUND) {
						validationMessage.value = { email: [message] }
					}

				} else if (_page.value === PAGES.confirm) {
					if (status === STATUS.BAD_REQUEST) {
						validationMessage.value = { password: [message] }
					} else if (status === STATUS.NOT_FOUND) {
						validationMessage.value = { password: [message] }
					}
				}

				console.log(`serverValidation error:`, ctx.data, ctx.error)

				return ctx
			},
		}).post(_state) // метод должен принимать реактивные данные на случай опции refetch

	return {
		validationMessage,
		sensitiveMessage,
		send,
		isFetching,
	}
}
