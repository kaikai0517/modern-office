<template>
	<n-page-header subtitle="虛擬辦公室" @back="handleBack" class="px-5 py-5">
		<template #title>
			<a href="https://anyway.fm/" style="text-decoration: none; color: inherit"
				>Modern Office</a
			>
		</template>
		<template #extra>
			<NButton v-if="currentConnection" type="primary" @click="OpenMessage">
				Messages
			</NButton>
		</template>
	</n-page-header>
	<n-drawer v-model:show="open" :width="502" :placement="placement">
		<n-drawer-content title="Stoner">
			Stoner is a 1965 novel by the American writer John Williams.
		</n-drawer-content>
	</n-drawer>
</template>

<script setup lang="ts">
import { NPageHeader, NDrawer, NButton, NDrawerContent } from "naive-ui";
import type { DrawerPlacement } from "naive-ui";
import { storeToRefs } from "pinia";
import { useWebRTCStore } from "../store/WebRTC";

const webRTCStore = useWebRTCStore();
const { currentConnection } = storeToRefs(webRTCStore);

const open = ref(false);
const placement = ref<DrawerPlacement>("right");

const OpenMessage = () => {
	open.value = true;
};
const handleBack = () => {};
</script>

<style></style>
