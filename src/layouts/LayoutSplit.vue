<template>
	<div class="grid grid-cols-[minmax(200px,1fr)_2fr] grid-rows-1 h-[100vh] max-md:grid-cols-1">

		<div>
			<slot />
		</div>

		<div class="grid place-items-center bg-[rgb(232_237_243)] max-md:hidden">
			<img
				src="/src/assets/img/banner.webp"
				width="512"
				height="480"
				alt="banner"
				class="object-contain max-w-1/3"
			/>
		</div>
	</div>
</template>

<script
	setup
	lang="ts"
>

</script>

<style scoped></style>
