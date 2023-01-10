<template>
	<div v-show="isConnect">
		<video width="200" height="200" autoPlay ref="remoteVideo" muted />
		<div class="text-white">Remote</div>
	</div>
</template>

<script setup lang="ts">
import { useWebRTCStore } from "../store/WebRTC";
import { storeToRefs } from "pinia";
const webRTCStore = useWebRTCStore();
const { remoteVideo, isConnect } = storeToRefs(webRTCStore);
</script>

<style></style>
