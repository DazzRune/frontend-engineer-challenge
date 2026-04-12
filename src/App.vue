<!--
todo - проект без MSW разместить в git master, а с MSW - в branch и deploy
 -->
<template>
	<LayoutSplit v-if="page === PAGES.login || page === PAGES.register">
		<router-view></router-view>
	</LayoutSplit>

	<router-view v-else></router-view>

	<!-- <div class="fixed top-0 right-0">
		<ScreensMenu />
	</div> -->
</template>

<script
	setup
	lang="ts"
>
import { PAGES, type TPage } from './assets/scripts/constants';

const route = useRoute()
const page = computed(() => PAGES[route.name as TPage])

</script>

<style scoped></style>
