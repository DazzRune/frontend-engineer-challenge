<template>
	<!-- Проверка почты
	После успешного ввода на указанный e-mail приходит письмо с ссылкой для восстановления пароля.
	Дальнейший процесс восстановления пароля происходит через эту ссылку. -->
	<LayoutAccent>
		<template #title>
			{{ TITLE_PER_PAGE[PAGES.notify] }}
		</template>

		<template #default>
			{{ MESSAGE_PER_PAGE[PAGES.notify] }}
		</template>

		<template #actions>
			<router-link
				:to="{ name: ACTION_PER_PAGE[PAGES.notify]?.to }"
				class="btn btn-accent-lighter"
			>
				{{ ACTION_PER_PAGE[PAGES.notify]?.title }}
			</router-link>
		</template>
	</LayoutAccent>
</template>

<script
	setup
	lang="ts"
>
import { ACTION_PER_PAGE, PAGES, MESSAGE_PER_PAGE, TITLE_PER_PAGE } from '@/assets/scripts/constants';


</script>

<style scoped></style>
