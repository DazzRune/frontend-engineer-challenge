<template>

	<LayoutAccent>
		<template #title>
			{{ TITLE_PER_PAGE[page] }}
		</template>

		<template #default>
			<BaseForm
				v-model="state"
				:message="browserMessage"
				@submit="onSubmit"
			/>

			<p
				v-if="serverSensitiveMessage"
				class="message text-center"
			>
				{{ serverSensitiveMessage }}
			</p>
		</template>

		<template #actions>
			<!-- Забыли пароль? -->
			<router-link
				v-if="page === PAGES.login"
				:to="{ name: PAGES.reset }"
				class="btn btn-unaccent"
			>
				Забыли пароль?
			</router-link>
			<!-- Условия -->
			<p
				v-if="page === PAGES.register"
				class="mt-6 text-size-tertiary text-tertiary text-center"
			>
				Зарегистрировавшись пользователь принимает условия
				<a class="link-underline">договора оферты</a> и
				<a class="link-underline">политики конфиденциальности</a>
			</p>
		</template>

		<template #footer>
			<p v-if="page === PAGES.login">
				<span>Еще не зарегестрированы?</span>
				<router-link
					:to="{ name: PAGES.register }"
					class="link-inline"
				>
					Регистрация
				</router-link>
			</p>

			<p v-if="page === PAGES.register">
				<span>Уже есть аккаунт?</span>
				<router-link
					:to="{ name: PAGES.login }"
					class="link-inline"
				>
					Войти
				</router-link>
			</p>
		</template>
	</LayoutAccent>
</template>

<script
	setup
	lang="ts"
>
import { STATUS, TITLE_PER_PAGE, ACTION_TRY_AGAIN, ACTION_PER_PAGE, PAGES, type TFormPage, MESSAGE_PER_STATUS } from '@/assets/scripts/constants';
import { type TSchemaLogin, type TSchemaReset, type TSchemaRegister, type TSchemaConfirm, schemaLogin, schemaRegister, schemaReset, schemaConfirm, type ValiSchema, type TSchema } from '../schema';
import { SCHEMA_PER_PAGE } from '@/assets/scripts/constants';
import { useServerValidation } from '@/composables/useServerValidation';
import { useBrowserValidation } from '@/composables/useBrowserValidation';

const router = useRouter()
const route = useRoute()
const page = computed(() => route.name as TFormPage)
const schema = computed((): ValiSchema => SCHEMA_PER_PAGE[page.value])

// const state = ref(setState(schema.value))
const state = ref(setState(Object.keys(schema.value.entries) as keyof TSchema))

// валидация на стороне пользователя успешна? да - делаем запрос и ждем результат серверной валидации
const { message: browserValidationMessage, execute: onBrowserValidation } = useBrowserValidation(state, schema)
const { validationMessage: serverValidationMessage, sensitiveMessage: serverSensitiveMessage, send: onServerValidation } = useServerValidation(state, page)

// по приоритету обработки на клиенте
const browserMessage = computed(() => {
	return browserValidationMessage.value ?? serverValidationMessage.value ?? null
})

// по приоритету обработки на сервере
const serverMessage = computed(() => {
	return serverSensitiveMessage.value ?? serverValidationMessage.value ?? null
})

watch((): ValiSchema => schema.value, (v: ValiSchema) => {
	state.value = setState(Object.keys(v.entries) as keyof TSchema)
})

async function onSubmit(data: SubmitEvent) {
	onBrowserValidation()
	if (browserValidationMessage.value) {
		return
	}

	await onServerValidation()
	if (serverMessage.value) {
		if (page.value === PAGES.confirm && serverSensitiveMessage.value === MESSAGE_PER_STATUS[STATUS.INTERNAL_SERVER_ERROR]) {
			router.push({
				name: ACTION_PER_PAGE[PAGES.confirm].to,
				state: { data: false }
			})
		}

		return
	}

	// фактически любой тип данных для передачи следующей странице, чтобы там определить успешность запроса
	let nextPageData: string | boolean | null = null

	if (page.value === PAGES.login || page.value === PAGES.register) nextPageData = (state.value as TSchemaLogin | TSchemaRegister).email
	else if (page.value === PAGES.confirm) nextPageData = true

	router.push({
		name: ACTION_PER_PAGE[page.value].to,
		state: { data: nextPageData }
	})
}

function setState<T extends TSchema>(arr: Array<keyof T>) {
	return arr.reduce((acc, cur) => {
		acc[cur] = '' as T[keyof T]
		return acc
	}, {} as T)
}
</script>

<style scoped></style>
