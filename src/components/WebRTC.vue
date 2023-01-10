<template>
	<div class="my-10 space-y-5 relative">
		<div class="text-white flex gap-5 items-center">
			<div>我的WebRTC ID:</div>

			<div class="text-yellow-500">{{ localPlayer.WebRTCId }}</div>
		</div>
		<div class="flex gap-5">
			<div class="flex gap-5" v-if="isConnect">
				<NButton type="error" @click="EndCall"> End </NButton>
			</div>
		</div>
		<div class="space-y-2">
			<label for="name" class="text-yellow-500">修改名字</label>
			<n-input
				id="name"
				v-model:value="localPlayer.name"
				autosize
				@blur="isTypingName = false"
				@focus="isTypingName = true"
				class="w-full"
				type="text"
				placeholder="請輸入名字"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useWebRTCStore } from "../store/WebRTC";
import { NButton, NInput } from "naive-ui";
import { storeToRefs } from "pinia";
import { useSocketStore } from "../store/Socket";

// socketStore
const socketStore = useSocketStore();
const { localPlayer, isTypingName } = storeToRefs(socketStore);

// WebRTCStore
const webRTCStore = useWebRTCStore();
const { EndCall, createPeer, destroyPeer } = webRTCStore;
const { isConnect } = storeToRefs(webRTCStore);

onMounted(() => {
	createPeer();
});

onUnmounted(() => {
	destroyPeer();
});
</script>

<style>
video {
	transform: scaleX(-1);
}
</style>
