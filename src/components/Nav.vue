<template>
	<!-- Header -->
	<n-page-header subtitle="虛擬辦公室" class="px-5 py-5">
		<template #title>
			<a
				href="https://github.com/kaikai0517/modern-office"
				style="text-decoration: none; color: inherit"
				>Modern Office</a
			>
		</template>
		<template #extra>
			<div class="text-white flex gap-3 items-center">
				<!-- 在線人數 -->
				<div>在線人數 {{ OnlinePersonNums }}</div>
				<!-- P2P聊天室開關 -->
				<NButton type="primary" @click="OpenMessage"> Message </NButton>
			</div>
		</template>
	</n-page-header>
	<!-- P2P聊天室 -->
	<P2PChat :open-outer="openOuter" @close="close"></P2PChat>
</template>

<script setup lang="ts">
import { NPageHeader, NButton } from "naive-ui";
import { storeToRefs } from "pinia";
import { useSocketStore } from "../store/Socket";
import P2PChat from "./P2PChat.vue";

/**
 * socketStore
 */
const socketStore = useSocketStore();
const { remotePlayerMap } = storeToRefs(socketStore);

/**
 * 在線人數 => 遠端人數+自己
 */
const OnlinePersonNums = computed(() => remotePlayerMap.value.size + 1);

/**
 * 用戶列表是否顯示
 */
const openOuter = ref(false);

/**
 * 開啟用戶列表
 */
const OpenMessage = () => {
	openOuter.value = true;
};

/**
 * 關閉用戶列表
 */
const close = () => {
	openOuter.value = false;
};
</script>

<style></style>
