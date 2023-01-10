<script setup lang="ts">
import Nav from "./components/Nav.vue";
import { NConfigProvider, NMessageProvider } from "naive-ui";
import { darkTheme } from "naive-ui";
import type { GlobalTheme } from "naive-ui";

const theme = ref<GlobalTheme | null>(darkTheme);
</script>

<template>
	<n-message-provider>
		<n-config-provider :theme="theme">
			<div class="bg-black">
				<Nav />
				<router-view></router-view>
			</div>
		</n-config-provider>
	</n-message-provider>
</template>

<style scoped></style>
