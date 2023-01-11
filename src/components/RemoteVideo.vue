<template>
	<!-- 遠端視頻 -->
	<div v-show="isConnect">
		<video
			:width="VIDEOWIDTH"
			:height="VIDEOHEIGHT"
			autoPlay
			ref="remoteVideo"
		/>
		<div class="text-white">Remote</div>
	</div>
</template>

<script setup lang="ts">
import { useWebRTCStore } from "../store/WebRTC";
import { storeToRefs } from "pinia";

/**
 * WebRTCStore
 */
const webRTCStore = useWebRTCStore();
const { remoteVideo, isConnect } = storeToRefs(webRTCStore);

/**
 * 視頻寬高
 */
const VIDEOWIDTH = "200";
const VIDEOHEIGHT = "200";
</script>

<style></style>
