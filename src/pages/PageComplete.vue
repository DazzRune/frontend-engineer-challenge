<template>
	<LayoutAccent>
		<template #title>
			{{ isSuccess ?
				TITLE_COMPLETE_PAGE.success :
				TITLE_COMPLETE_PAGE.failed }}
		</template>

		<template #default>
			{{ isSuccess ?
				MESSAGE_COMPLETE_PAGE.success :
				MESSAGE_COMPLETE_PAGE.failed }}
		</template>

		<template #actions>
			<router-link
				:to="{ name: ACTION_PER_PAGE[PAGES.complete]?.to }"
				class="btn btn-accent-lighter"
			>
				{{ ACTION_PER_PAGE[PAGES.complete]?.title }}
			</router-link>

			<router-link
				v-if="!isSuccess"
				:to="{ name: ACTION_TRY_AGAIN.to }"
				class="btn btn-unaccent"
			>
				{{ ACTION_TRY_AGAIN.title }}
			</router-link>
		</template>
	</LayoutAccent>
</template>

<script
	setup
	lang="ts"
>
import { ACTION_TRY_AGAIN, ACTION_PER_PAGE, MESSAGE_COMPLETE_PAGE, PAGES, MESSAGE_PER_PAGE, TITLE_COMPLETE_PAGE } from '@/assets/scripts/constants'

const isSuccess = computed(() => {
	return history.state.data
})
</script>

<style scoped></style>
