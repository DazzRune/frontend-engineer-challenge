<template>
	<section class="grid grid-cols-1 grid-rows-[min-content_1fr_min-content] h-[100vh]">
		<TheHeader />

		<div class="grid place-items-center">

			<div class="p-1 w-[clamp(200px,75%,480px)]">
				<div class="flex items-center flex-nowrap">
					<button
						v-if="page === PAGES.reset"
						@click="router.push({ name: PAGES.register })"
						class="mr-[1em] h-[calc(var(--text-size-title)*0.7)]"
					>
						<IconArrow class="w-auto h-full" />
					</button>
					<h1>
						<slot name="title" />
					</h1>
				</div>

				<p class="details mt-1">
					<slot />
				</p>

				<div>
					<slot name="actions" />
				</div>
			</div>
		</div>

		<footer class="details text-center">
			<slot name="footer" />
		</footer>
	</section>
</template>

<script
	setup
	lang="ts"
>
import { PAGES } from '@/assets/scripts/constants';

const router = useRouter()
const route = useRoute()
const page = computed(() => route.name as string)
</script>

<style scoped></style>
