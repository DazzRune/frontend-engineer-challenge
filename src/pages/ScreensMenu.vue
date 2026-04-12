<template>
	<div class="*:block">
		{{ 'a@a.aa' }}
		<button @click="clearCookies">Очистить все куки</button>

		<router-link :to="{ name: PAGES.login }">
			Войти в систему
		</router-link>

		<router-link :to="{ name: PAGES.welcomeback }">
			С возвращением
		</router-link>

		<router-link :to="{ name: PAGES.register }">
			Регистрация в системе
		</router-link>

		<router-link :to="{ name: PAGES.welcome }">
			Добро пожаловать
		</router-link>

		<router-link :to="{ name: PAGES.reset }">
			Восстановление пароля
		</router-link>

		<router-link :to="{ name: PAGES.notify }">
			Проверьте свою почту
		</router-link>

		<router-link :to="{ name: PAGES.confirm }">
			Задайте пароль
		</router-link>

		<router-link :to="{ name: PAGES.complete }">
			Пароль был восстановлен
		</router-link>
	</div>
</template>

<script
	setup
	lang="ts"
>
import { PAGES, URL_BASE } from '@/assets/scripts/constants';

function clearCookies() {
	fetch(`${URL_BASE}logout`, { method: 'POST' })
}
</script>

<style scoped></style>
