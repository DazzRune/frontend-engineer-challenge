import type { TSchema, ValiSchema } from "@/schema"
import * as v from "valibot"

export function useBrowserValidation(state: MaybeRefOrGetter<TSchema>, schema: MaybeRefOrGetter<ValiSchema>, isImmediate: boolean = false) {
	const _state = computed(() => toValue(state))
	const _schema = computed(() => toValue(schema))

	const message = ref<Record<keyof TSchema, string> | null>(null)

	if (isImmediate) execute()

	// сброс сообщения на событие input (это более инкапсулированный, но менее производительный вариант). другой - разместить в метод и предоставить доступ извне
	watch(() => Object.values(_state.value), () => {
		message.value = null
	})

	function execute() {
		try {
			v.parse(_schema.value, _state.value) // в случае ошибки выбрасывает исключение ValiError
			message.value = null
		} catch (e) {
			if (v.isValiError(e)) {
				const normalize = v.flatten(e.issues).nested;
				/* Пример ->
				{
					email: ['Некорректный email'],
					password: ['Минимум 8 символов', 'Не должен содержать пробелы'],
				} */
				message.value = { ...normalize }

				console.log('ValiError:', normalize);

			} else {
				message.value = {}
				console.log('validation unknown Error:', message.value);
			}
		}
	}

	return {
		message,
		execute,
	}
}
