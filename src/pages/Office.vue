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
		<div class="fixed bottom-[3%] right-[3%]">
			<Chat></Chat>
		</div>
	</div>
</template>

<script setup lang="ts">
import Canva from "../components/Canva.vue";
import WebRTC from "../components/WebRTC.vue";
import LocalVideo from "../components/LocalVideo.vue";
import RemoteVideo from "../components/RemoteVideo.vue";
import Chat from "../components/Chat.vue";
import { useSocketStore } from "../store/Socket";
import { storeToRefs } from "pinia";
import { useWebRTCStore } from "../store/WebRTC";

/**
 * socketStore
 */
const socketStore = useSocketStore();
const { handleSocketMessage, sendPlayer } = socketStore;

/**
 * WebRTCStore
 */
const webRTCStore = useWebRTCStore();
const { WebRTCConnect } = storeToRefs(webRTCStore);

/**
 * 監聽socket訊息
 */
onMounted(() => {
	handleSocketMessage();
});

/**
 * WevRTC建立完畢送出人物
 */
watch(
	() => WebRTCConnect.value,
	() => {
		sendPlayer();
	}
);
</script>

<style></style>
