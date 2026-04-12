import { STATUS, MESSAGE_PER_STATUS, URL_BASE, PAGES } from '@/assets/scripts/constants'
import { schemaConfirm, schemaLogin, schemaRegister, schemaReset, type TSchemaConfirm, type TSchemaLogin, type TSchemaRegister, type TSchemaReset } from '@/schema'
import { useLocalStorage } from '@vueuse/core'
import { http, HttpResponse, delay } from 'msw'
import * as v from "valibot"

const ATTEMPTS_LIMIT = 100

let loginRequestId: string | null = null // клиентская защита от множественных запросов
let registerRequestId: string | null = null // клиентская защита от множественных запросов
let resetRequestId: string | null = null // клиентская защита от множественных запросов
let confirmRequestId: string | null = null // клиентская защита от множественных запросов
let attempts: number = 0 // серверная защита от множественных запросов
let resetToken: string | null = null // реализован через переменную, а не через заголовок 'Set-Cookie' из-за невозможности его затем вычистить из MSW, чтобы например проверить сценарий отсутствия токена при создании пароля

const RESPONSE_PER_ERROR_CODE = {
	[STATUS.BAD_REQUEST]: () => HttpResponse.json({
		code: STATUS.BAD_REQUEST,
		message: MESSAGE_PER_STATUS[STATUS.BAD_REQUEST]
	}, { status: STATUS.BAD_REQUEST }),
	[STATUS.INVALID_CREDENTIALS]: () => HttpResponse.json({
		code: STATUS.INVALID_CREDENTIALS,
		message: MESSAGE_PER_STATUS[STATUS.INVALID_CREDENTIALS]
	}, { status: STATUS.INVALID_CREDENTIALS }),
	[STATUS.NOT_FOUND]: () => HttpResponse.json({
		code: STATUS.NOT_FOUND,
		message: MESSAGE_PER_STATUS[STATUS.NOT_FOUND]
	}, { status: STATUS.NOT_FOUND }),
	[STATUS.ALREADY_EXISTS]: () => HttpResponse.json({
		code: STATUS.ALREADY_EXISTS,
		message: MESSAGE_PER_STATUS[STATUS.ALREADY_EXISTS]
	}, { status: STATUS.ALREADY_EXISTS }),
	[STATUS.RATE_LIMITED]: () => HttpResponse.json({
		code: STATUS.RATE_LIMITED,
		message: MESSAGE_PER_STATUS[STATUS.RATE_LIMITED]
	}, { status: STATUS.RATE_LIMITED }),
	[STATUS.INTERNAL_SERVER_ERROR]: () => HttpResponse.json({
		code: STATUS.INTERNAL_SERVER_ERROR,
		message: MESSAGE_PER_STATUS[STATUS.INTERNAL_SERVER_ERROR]
	}, { status: STATUS.INTERNAL_SERVER_ERROR }),
	[STATUS.SERVICE_UNAVAILABLE]: () => HttpResponse.json({
		code: STATUS.SERVICE_UNAVAILABLE,
		message: MESSAGE_PER_STATUS[STATUS.SERVICE_UNAVAILABLE]
	}, { status: STATUS.SERVICE_UNAVAILABLE }),
	[STATUS.CLIENT_CLOSED]: () => HttpResponse.json({
		code: STATUS.CLIENT_CLOSED,
		message: MESSAGE_PER_STATUS[STATUS.CLIENT_CLOSED],
	}, { status: STATUS.CLIENT_CLOSED }),
}

// ! важен порядок проверок
export const handlers = [
	// Перехватываем запросы GET, POST, PUT и т.д.

	// LOGIN
	http.post(`${URL_BASE}${PAGES.login}`, async (info) => {
		// подписываемся на отмену текущего запроса, если уже пришел новый
		const requestId = crypto.randomUUID()
		loginRequestId = requestId

		// Имитируем задержку сети
		// await delay(2000)
		const body = await info.request.json() as TSchemaLogin // заголовки
		const cookies = info.cookies // cookies - объект {name, value}, где value - значение в виде строки (не парсится)
		console.log('login interceptor:', body, cookies);

		attempts++

		let usersBase = JSON.parse(localStorage.getItem('users-base') ?? '{}') as Record<TSchemaLogin['email'], TSchemaLogin['password']>;

		// 500 STATUS.INTERNAL_SERVER_ERROR (для простого теста достаточно просто ввести в поле почты 'internal@server.er')
		if (body.email === 'internal@server.er') {
			return RESPONSE_PER_ERROR_CODE[STATUS.INTERNAL_SERVER_ERROR]?.()
		}

		// 503 STATUS.SERVICE_UNAVAILABLE - Сервис временно недоступен, бд недоступна (для простого теста достаточно просто ввести в поле почты 'internal@server.er')
		if (body.email === 'service@unavailable.er') {
			return RESPONSE_PER_ERROR_CODE[STATUS.SERVICE_UNAVAILABLE]?.()
		}

		// если пришёл новый запрос — этот уже устарел
		if (loginRequestId !== requestId) {
			return RESPONSE_PER_ERROR_CODE[STATUS.CLIENT_CLOSED]?.()
		}

		// 429 STATUS.RATE_LIMITED - после каждой 3-ей попытки, без кулдауна
		if (attempts > ATTEMPTS_LIMIT) {
			attempts = 0
			return RESPONSE_PER_ERROR_CODE[STATUS.RATE_LIMITED]?.()
		}

		// 400 STATUS.BAD_REQUEST - несоответствующий формат тела
		if (!v.safeParse(schemaLogin, body).success) {
			return RESPONSE_PER_ERROR_CODE[STATUS.BAD_REQUEST]?.()
		}

		// 404 STATUS.NOT_FOUND - при попытке входа с несуществующим аккаунтом (email)
		if (!usersBase[body.email]) {
			return RESPONSE_PER_ERROR_CODE[STATUS.NOT_FOUND]?.()
		}

		// 401 STATUS.INVALID_CREDENTIALS - неверные учетные данные (email,pass)
		if (!usersBase[body.email] || usersBase[body.email] !== body.password) {
			return RESPONSE_PER_ERROR_CODE[STATUS.INVALID_CREDENTIALS]?.()
		}

		/* Headers - стандартный способ формирования куки.
		флаг HttpOnly опущен, т.к. MSW не дает с ним отобразить куки в devtools
		при отсутствии флага Max-Age кука будет сессионной */
		const headers = new Headers()
		headers.append('Set-Cookie', 'access_token=access_1; Path=/')
		headers.append('Set-Cookie', 'refresh_token=refresh_1; Path=/')

		return HttpResponse.json(
			// сначала данные
			{
				success: true,
				data: {
					accessToken: 1, // string e.g. eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
					refreshToken: 1, // string e.g. eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
					tokenType: 'Bearer', // string
					expiresIn: 3600, // integer Access token lifetime in seconds
				},
			},
			// потом конфиг
			{
				status: 200,
				headers
			})
	}),

	// REGISTER
	http.post(`${URL_BASE}${PAGES.register}`, async (info) => {
		const requestId = crypto.randomUUID()
		registerRequestId = requestId

		// await delay(1000)
		const body = await info.request.json() as TSchemaLogin // заголовки
		console.log('register interceptor:', body);

		attempts++

		let usersBase = JSON.parse(localStorage.getItem('users-base') ?? '{}') as Record<TSchemaLogin['email'], TSchemaLogin['password']>;

		// 500 STATUS.INTERNAL_SERVER_ERROR (для простого теста достаточно просто ввести в поле почты 'internal@server.er')
		if (body.email === 'internal@server.er') {
			return RESPONSE_PER_ERROR_CODE[STATUS.INTERNAL_SERVER_ERROR]?.()
		}

		// 503 STATUS.SERVICE_UNAVAILABLE - Сервис временно недоступен, бд недоступна (для простого теста достаточно просто ввести в поле почты 'internal@server.er')
		if (body.email === 'service@unavailable.er') {
			return RESPONSE_PER_ERROR_CODE[STATUS.SERVICE_UNAVAILABLE]?.()
		}

		if (registerRequestId !== requestId) {
			return RESPONSE_PER_ERROR_CODE[STATUS.CLIENT_CLOSED]?.()
		}

		// 429 STATUS.RATE_LIMITED - после каждого 3-его запроса, без кулдауна
		if (attempts > ATTEMPTS_LIMIT) {
			attempts = 0
			return RESPONSE_PER_ERROR_CODE[STATUS.RATE_LIMITED]?.()
		}

		// 400 STATUS.BAD_REQUEST - несоответствующий формат тела (для простого теста достаточно просто ввести в поле почты 'invalid@argument.com')
		if (!v.safeParse(schemaRegister, body).success || body.email === 'invalid@argument.com') {
			return RESPONSE_PER_ERROR_CODE[STATUS.BAD_REQUEST]?.()
		}

		// 409 STATUS.ALREADY_EXISTS - вместо базы используем localStorage
		if (usersBase[body.email]) {
			// ошибка будет передана в обработчик onFetchError, а ctx.data станет null
			return RESPONSE_PER_ERROR_CODE[STATUS.ALREADY_EXISTS]?.()
		}

		// для надежности следовало бы ключи в usersBase хранить в виде user_id, но это моки и банально легче будет искать по адресу почты, ведь она сюда приходит прямо из заголовка
		if (Object.keys(usersBase).length) {
			usersBase[body.email] = body.password
			localStorage.setItem('users-base', JSON.stringify(usersBase))
		} else {
			localStorage.setItem('users-base', JSON.stringify({ [body.email]: body.password }))
		}

		const headers = new Headers()
		headers.append('Set-Cookie', 'access_token=access_1; Path=/')
		headers.append('Set-Cookie', 'refresh_token=refresh_1; Path=/')

		return HttpResponse.json(
			{
				success: true,
				data: {
					id: '1',
					email: body.email,
					createdAt: Date.now(), // e.g. '2024-03-27T10:30:00Z'
					updatedAt: Date.now(), // e.g. '2024-03-27T10:30:00Z'
				},

			},
			{
				status: 201,
				headers
			})
	}),

	// RESET (/request-reset-password)
	http.post(`${URL_BASE}${PAGES.reset}`, async (info) => {
		const requestId = crypto.randomUUID()
		resetRequestId = requestId

		// await delay(1000)
		const body = await info.request.json() as TSchemaReset // заголовки
		console.log('reset interceptor:', body);

		attempts++

		let usersBase = JSON.parse(localStorage.getItem('users-base') ?? '{}') as Record<TSchemaLogin['email'], TSchemaLogin['password']>;

		// 503 STATUS.SERVICE_UNAVAILABLE - Сервис временно недоступен, бд недоступна (для простого теста достаточно просто ввести в поле почты 'internal@server.er')
		if (body.email === 'service@unavailable.er') {
			return RESPONSE_PER_ERROR_CODE[STATUS.SERVICE_UNAVAILABLE]?.()
		}

		// 500 STATUS.INTERNAL_SERVER_ERROR (для простого теста достаточно просто ввести в поле почты 'internal@server.er')
		if (body.email === 'internal@server.er') {
			return RESPONSE_PER_ERROR_CODE[STATUS.INTERNAL_SERVER_ERROR]?.()
		}

		if (resetRequestId !== requestId) {
			return RESPONSE_PER_ERROR_CODE[STATUS.CLIENT_CLOSED]?.()
		}

		// 429 STATUS.RATE_LIMITED - после каждой 3-ей попытки, без кулдауна
		if (attempts > ATTEMPTS_LIMIT) {
			attempts = 0
			return RESPONSE_PER_ERROR_CODE[STATUS.RATE_LIMITED]?.()
		}

		// 400 STATUS.BAD_REQUEST - несоответствующий формат тела (для простого теста достаточно просто ввести в поле почты 'invalid@argument.com')
		if (!v.safeParse(schemaReset.entries.email, body.email).success || body.email === 'invalid@argument.com') {
			return RESPONSE_PER_ERROR_CODE[STATUS.BAD_REQUEST]?.()
		}

		// 404 STATUS.NOT_FOUND - при попытке ввести несуществующий аккаунт (email)
		if (!usersBase[body.email]) {
			return RESPONSE_PER_ERROR_CODE[STATUS.NOT_FOUND]?.()
		}

		// const headers = new Headers()
		// headers.append('Set-Cookie', 'reset_token=reset_1; Path=/')
		resetToken = 'reset_1'

		return HttpResponse.json(
			// сначала данные
			{
				success: true,
				data: `Password reset email sent`,
			},
			// потом конфиг
			{
				status: 200,
				// headers
			})
	}),

	// CONFIRM (/reset-password)
	http.post(`${URL_BASE}${PAGES.confirm}`, async (info) => {
		const requestId = crypto.randomUUID()
		confirmRequestId = requestId

		// await delay(1000)
		const body = await info.request.json() as TSchemaConfirm & { token: string } // заголовки
		const cookies = info.cookies // всегда объект
		console.log('confirm interceptor:', body, cookies);

		// 503 STATUS.SERVICE_UNAVAILABLE - Сервис временно недоступен, бд недоступна (для простого теста достаточно просто ввести в поле почты 'internal@server.er')
		if (body.password === 'serviceunavailable') {
			return RESPONSE_PER_ERROR_CODE[STATUS.SERVICE_UNAVAILABLE]?.()
		}

		// 500 STATUS.INTERNAL_SERVER_ERROR (для простого теста достаточно просто ввести в поле почты 'internal@server.er')
		if (body.password === 'internalservererror') {
			return RESPONSE_PER_ERROR_CODE[STATUS.INTERNAL_SERVER_ERROR]?.()
		}

		if (confirmRequestId !== requestId) {
			return RESPONSE_PER_ERROR_CODE[STATUS.CLIENT_CLOSED]?.()
		}

		// 429 STATUS.RATE_LIMITED - после каждой 3-ей попытки, без кулдауна
		if (attempts > ATTEMPTS_LIMIT) {
			attempts = 0
			return RESPONSE_PER_ERROR_CODE[STATUS.RATE_LIMITED]?.()
		}

		// 400 STATUS.BAD_REQUEST - несоответствующий формат тела (для простого теста достаточно просто ввести в поле паролей 'invalidargument')
		// !cookies.reset_token
		if (!v.safeParse(schemaConfirm.entries.password, body.password).success || body.password === 'invalidargument') {
			return RESPONSE_PER_ERROR_CODE[STATUS.BAD_REQUEST]?.()
		}

		// 404 STATUS.NOT_FOUND - при отсутствии токена
		if (!resetToken) {
			return RESPONSE_PER_ERROR_CODE[STATUS.NOT_FOUND]?.()
		}

		return HttpResponse.json(
			// сначала данные
			{
				success: true,
				data: `Password reset successfully for user id: 1`,
			},
			// потом конфиг
			{
				status: 200,
			})
	}),

	// LOGOUT - для очистки локальных куки (только при тестировании с MSW)
	http.post(`${URL_BASE}logout`, () => {
		const headers = new Headers()
		headers.append('Set-Cookie', 'access_token=; Max-Age=0; Path=/')
		headers.append('Set-Cookie', 'refresh_token=; Max-Age=0; Path=/')
		// headers.append('Set-Cookie', 'reset_token=; Max-Age=0; Path=/')
		resetToken = null

		return HttpResponse.json(null, { status: 200, headers })
	}),

]
