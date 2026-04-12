<template>
	<LayoutAccent>
		<template #title>
			По-моему мы ходим кругами...
		</template>

		<template #default>
			<div>
				<!-- https://www.artstation.com/artwork/8woXRO -->
				<img
					src="/src/assets/img/404.gif"
					alt="Image not found"
					class="object-contain"
				>
			</div>
		</template>

		<template #actions>
			<router-link
				:to="{ name: PAGES.login }"
				class="btn btn-accent-lighter"
			>
				Назад в авторизацию
			</router-link>
		</template>
	</LayoutAccent>
</template>

<script
	setup
	lang="ts"
>
import { PAGES } from '@/assets/scripts/constants';


</script>

<style scoped></style>
