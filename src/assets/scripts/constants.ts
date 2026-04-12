import { SCHEMAS } from "@/schema"

export const URL_BASE = import.meta.env.BASE_URL
export const URL_ORIGIN = 'http://127.0.0.1:8080/api/v1/auth/'

export const STATUS = {
	AUTHENTICATED: 200,
	CREATED: 201,
	BAD_REQUEST: 400,
	INVALID_CREDENTIALS: 401, // invalid credentials
	NOT_FOUND: 404, // ресурс не найден
	ALREADY_EXISTS: 409,
	RATE_LIMITED: 429,
	CLIENT_CLOSED: 499, // только для MSW
	INTERNAL_SERVER_ERROR: 500,
	SERVICE_UNAVAILABLE: 503, // (БД не доступна)
}

export const MESSAGE_PER_STATUS = {
	[STATUS.AUTHENTICATED]: 'Успешно авторизован',
	[STATUS.CREATED]: 'Пользователь создан',
	[STATUS.BAD_REQUEST]: 'Введены некорректные данные',
	[STATUS.INVALID_CREDENTIALS]: 'Введены неверные данные',
	[STATUS.NOT_FOUND]: 'Пользователь не существует',
	[STATUS.ALREADY_EXISTS]: 'Данный адрес уже занят',
	[STATUS.RATE_LIMITED]: 'Превышено количество запросов',
	[STATUS.CLIENT_CLOSED]: 'Запрос прерван пользователем',
	[STATUS.INTERNAL_SERVER_ERROR]: 'Внутрення ошибка сервера',
	[STATUS.SERVICE_UNAVAILABLE]: 'Сервис временно недоступен',
} as const

export const PAGES = {
	menu: 'menu',
	login: 'login',
	welcomeback: 'welcomeback',
	register: 'register',
	welcome: 'welcome',
	reset: 'request-password-reset',
	notify: 'notify',
	confirm: 'reset-password',
	complete: 'complete',
} as const

export type TPage = keyof typeof PAGES
export type TFormPage = typeof PAGES.login | typeof PAGES.register | typeof PAGES.reset | typeof PAGES.confirm

export const SCHEMA_PER_PAGE = {
	[PAGES.login]: SCHEMAS.login,
	[PAGES.register]: SCHEMAS.register,
	[PAGES.reset]: SCHEMAS.reset,
	[PAGES.confirm]: SCHEMAS.confirm,
}

export const TITLE_PER_PAGE = {
	[PAGES.login]: 'Войти в систему',
	[PAGES.welcomeback]: 'С возвращением',

	[PAGES.register]: 'Регистрация в системе',
	[PAGES.welcome]: 'Добро пожаловать',

	[PAGES.reset]: 'Восстановление пароля',
	[PAGES.notify]: 'Проверьте свою почту',

	[PAGES.confirm]: 'Задайте пароль',
}
export const TITLE_COMPLETE_PAGE = {
	success: 'Пароль был восстановлен',
	failed: 'Пароль не был восстановлен'
}

export const ACTION_PER_PAGE = {
	[PAGES.login]: { to: PAGES.welcomeback, title: 'Войти' },
	[PAGES.welcomeback]: { to: PAGES.login, title: 'Выйти' },

	[PAGES.register]: { to: PAGES.welcome, title: 'Зарегистрироваться' },
	[PAGES.welcome]: { to: PAGES.login, title: 'Выйти' },

	[PAGES.reset]: { to: PAGES.notify, title: 'Восстановить пароль' },
	[PAGES.notify]: { to: PAGES.login, title: 'Назад в авторизацию' },

	[PAGES.confirm]: { to: PAGES.complete, title: 'Изменить пароль' },
	[PAGES.complete]: { to: PAGES.login, title: 'Назад в авторизацию' },
}
export const ACTION_TRY_AGAIN = { to: PAGES.reset, title: 'Попробовать заново' }

export const MESSAGE_PER_PAGE = {
	[PAGES.welcomeback]: 'Что нового?',
	[PAGES.welcome]: 'Какие планы?',
	[PAGES.notify]: 'Мы отправили на почту письмо с ссылкой для восстановления пароля',
}
export const MESSAGE_COMPLETE_PAGE = {
	success: 'Перейдите на страницу авторизации, чтобы войти в систему с новым паролем',
	failed: 'По каким-то причинам мы не смогли изменить ваш пароль. Попробуйте ещё раз через некоторое время.'
}
