<template>
	<LayoutAccent>
		<template #title>
			{{ `${TITLE_PER_PAGE[PAGES.welcome]}, ${email}` }}
		</template>

		<template #default>
			{{ MESSAGE_PER_PAGE[PAGES.welcome] }}
		</template>

		<template #actions>
			<router-link
				:to="{ name: ACTION_PER_PAGE[PAGES.welcome]?.to }"
				class="btn btn-accent-lighter"
			>
				{{ ACTION_PER_PAGE[PAGES.welcome]?.title }}
			</router-link>
		</template>
	</LayoutAccent>
</template>

<script
	setup
	lang="ts"
>
import { ACTION_PER_PAGE, PAGES, MESSAGE_PER_PAGE, TITLE_PER_PAGE } from '@/assets/scripts/constants';

const email = computed(() => {
	return history.state.data
})
</script>

<style scoped></style>
