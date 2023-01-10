<template>
	<div v-show="isConnect">
		<div class="text-white">Local</div>
		<video width="200" height="200" autoPlay ref="localVideo" muted />
	</div>
</template>

<script setup lang="ts">
import { useWebRTCStore } from "../store/WebRTC";
import { storeToRefs } from "pinia";
import { useSocketStore } from "../store/Socket";

// socketStore
const socketStore = useSocketStore();
const { localPlayer } = storeToRefs(socketStore);
const webRTCStore = useWebRTCStore();
const { localVideo, isConnect } = storeToRefs(webRTCStore);
</script>

<style></style>
