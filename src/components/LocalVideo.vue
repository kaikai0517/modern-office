<template>
	<!-- 本地視頻 -->
	<div v-show="isConnect">
		<div class="text-white">Local</div>
		<video
			:width="VIDEOWIDTH"
			:height="VIDEOHEIGHT"
			autoPlay
			ref="localVideo"
			muted
		/>
	</div>
</template>

<script setup lang="ts">
import { useWebRTCStore } from "../store/WebRTC";
import { storeToRefs } from "pinia";

const VIDEOWIDTH = "200";
const VIDEOHEIGHT = "200";

// socketStore
const webRTCStore = useWebRTCStore();
const { localVideo, isConnect } = storeToRefs(webRTCStore);
</script>

<style></style>
