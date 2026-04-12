<template>
	<form
		@submit.prevent="emits('submit', $event)"
		novalidate
	>
		<template v-for="k in fieldNames">
			<!-- отображаем только первое сообщение из списка ошибок -->
			<BaseInput
				v-model="state[k]"
				:type="FIELD_ATTRS[k]['type']"
				:name="k"
				:is-valid="message?.[k] === undefined"
			>
				<template #default>
					{{ FIELD_ATTRS[k]['label'] }}
				</template>

				<template #message>
					{{ message?.[k]?.[0] }}
				</template>
			</BaseInput>
		</template>

		<button
			type="submit"
			class="btn disabled:brightness-50 disabled:cursor-not-allowed!"
			:class="[page === PAGES.login || page === PAGES.register ? 'btn-accent' : 'btn-accent-lighter']"
			:disabled="isLoading"
		>
			{{ ACTION_PER_PAGE[page]?.title }}
		</button>
	</form>
</template>

<script
	setup
	lang="ts"
>
import { ACTION_PER_PAGE, PAGES, type TFormPage } from '@/assets/scripts/constants';
import type { TSchema } from '@/schema';

// сопоставление полей формы с их атрибутами
const FIELD_ATTRS = {
	'email': { type: 'email', name: 'email', label: 'E-mail', message: '', default: '' },
	'password': { type: 'password', name: 'password', label: 'Пароль', message: '', default: '' },
	'newPassword': { type: 'password', name: 'newPassword', label: 'Повторите пароль', message: '', default: '' },
	// ...
}

const emits = defineEmits<{
	submit: [SubmitEvent],
}>()

const state = defineModel<TSchema>({
	default: {}
})

const fieldNames = computed(() => Object.keys(state.value ?? {}) as (keyof TSchema)[])

const { message = null, isLoading = false } = defineProps<{
	message?: Record<keyof TSchema, string> | null
	isLoading: boolean
}>()

const route = useRoute()
const page = computed(() => route.name as TFormPage)
</script>

<style scoped></style>
