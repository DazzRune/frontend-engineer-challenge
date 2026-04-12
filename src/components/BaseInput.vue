<template>
	<!--
	peer - размещается перед зависимым элементом
	placeholder="" - заменен абсолютно позиционированным тегом label, но должен быть установлен как заглушка без содержимого, чтобы классы привязывались к его стандартному состоянию
	mt - должен быть не меньше размера label
	pr - 22px ширина иконки для пароля -->
	<div class="mt-5">
		<!-- доп обертка для позиционирования label -->
		<div class="relative">
			<input
				v-bind="$attrs"
				placeholder=""
				v-model.trim="value"
				:type="type"
				class="peer py-2 text-size-primary leading-primary text-primary border-b-2 focus:outline-0"
				:class="{
					'pr-[22px]': INIT_TYPE === 'password',
					'border-passive not-placeholder-shown:border-accent': isValid,
					'border-invalid': !isValid
				}"
			/>

			<label class="floating-label">
				<slot />
			</label>

			<button
				v-if="INIT_TYPE === 'password' && value"
				@click.prevent="isPasswordVisible = !isPasswordVisible"
				class="absolute top-1/2 -translate-y-1/2 right-0 mt-auto! w-auto! h-3"
			>
				<IconEye class="w-auto h-full" />
			</button>
		</div>

		<!-- height - должен быть равен высоте ошибки для предотвращения скачков общей высоты комп-та -->
		<p class="message">
			<slot name="message" />
		</p>
	</div>
</template>

<script
	setup
	lang="ts"
>
import type { InputTypeHTMLAttribute } from 'vue';

// отменяем наследование атрибутов в комп-те
defineOptions({
	inheritAttrs: false
})

const attrs = useAttrs()
const INIT_TYPE = computed(() => attrs.type)

const value = defineModel({
	default: ''
})

const { isValid = true } = defineProps<{
	isValid: boolean
}>()

const isPasswordVisible = ref(false)

const type = computed((): InputTypeHTMLAttribute => {
	if (INIT_TYPE.value === 'password') {
		return isPasswordVisible.value ? 'text' : 'password'
	}
	return attrs.type as InputTypeHTMLAttribute
})
</script>

<style scoped>
.floating-label {
	position: absolute;
	left: 0;
	bottom: 50%;
	transform: translateY(50%);
	transition: all 0.2s ease;
	white-space: nowrap;
	pointer-events: none;
	font-size: var(--text-size-tertiary);

	.peer:focus~&,
	.peer:not(:placeholder-shown)~& {
		bottom: 100%;
		transform: translateY(0);
	}
}
</style>
