<template>
	<div class="flex flex-col items-center min-w-[848px] h-screen relative">
		<div class="fixed top-[3%] right-[3%]">
			<RemoteVideo></RemoteVideo>
		</div>
		<WebRTC />
		<Canva />
		<div class="fixed bottom-[3%] left-[3%]">
			<LocalVideo></LocalVideo>
		</div>
	</div>
</template>

<script setup lang="ts">
import Canva from "../components/Canva.vue";
import WebRTC from "../components/WebRTC.vue";
import LocalVideo from "../components/LocalVideo.vue";
import RemoteVideo from "../components/RemoteVideo.vue";
import { useSocketStore } from "../store/Socket";

// socketStore
const socketStore = useSocketStore();
const { handleMessage } = socketStore;

onMounted(() => {
	handleMessage();
});
</script>

<style></style>
