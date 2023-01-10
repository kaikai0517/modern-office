<template>
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
				<div>在線人數 {{ OnlinePersonNums }}</div>
				<NButton type="primary" @click="OpenMessage"> Message </NButton>
			</div>
		</template>
	</n-page-header>
	<n-drawer v-model:show="openOuter" :width="502" :placement="placement">
		<n-drawer-content title="Messenger">
			<n-list hoverable clickable>
				<n-list-item
					v-for="item in MessagePlayerArr"
					:key="item.WebRTCId"
					@click="connect(item.WebRTCId)"
				>
					<div class="flex gap-3 justify-between items-center">
						<div>
							<div>{{ item.name }}</div>
							<div>{{ item.WebRTCId }}</div>
						</div>
						<n-badge :value="messageUnreadCounts(item.WebRTCId)"> </n-badge>
					</div>
				</n-list-item>
			</n-list>
		</n-drawer-content>
	</n-drawer>
	<n-drawer v-model:show="openInner" :width="502" :placement="placement">
		<n-drawer-content :title="currentConnect" :native-scrollbar="false">
			<n-list :show-divider="false">
				<n-list-item v-for="item in messageFilterById" :key="item.message">
					<div :class="messageStyle(item.type)">{{ item.message }}</div>
				</n-list-item>
			</n-list>
			<template #footer>
				<div class="flex w-full gap-2">
					<n-input
						v-model:value="message"
						autosize
						type="textarea"
						placeholder="請輸入文字"
						@blur="isTypingName = false"
						@focus="isTypingName = true"
					/><NButton type="error" @click="sendMessage"> Send </NButton>
				</div>
			</template>
		</n-drawer-content>
	</n-drawer>
</template>

<script setup lang="ts">
import {
	NPageHeader,
	NDrawer,
	NButton,
	NDrawerContent,
	NList,
	NListItem,
	NInput,
	NBadge,
} from "naive-ui";
import type { DrawerPlacement } from "naive-ui";
import { storeToRefs } from "pinia";
import { useWebRTCStore } from "../store/WebRTC";
import { useSocketStore } from "../store/Socket";
import { MessageType } from "../model/schema";

// socketStore
const socketStore = useSocketStore();
const { remotePlayerMap, isTypingName } = storeToRefs(socketStore);

const webRTCStore = useWebRTCStore();
const { handleConnectButtonClick, handleSendMessageButtonClick } = webRTCStore;
const { messages } = storeToRefs(webRTCStore);

const currentConnect = ref<string | undefined>(undefined);

const OnlinePersonNums = computed(() => remotePlayerMap.value.size + 1);

const MessagePlayerArr = computed(() => {
	let arr = [];
	for (const [key, value] of remotePlayerMap.value.entries()) {
		arr.push(value);
	}
	return arr;
});

const openOuter = ref(false);
const openInner = ref(false);
const placement = ref<DrawerPlacement>("right");

const messageStyle = (type: MessageType) => {
	switch (type) {
		case "local":
			return "ml-auto !px-3 !py-1 bg-yellow-500 rounded-full w-fit";
		case "remote":
			return " !px-3 !py-1 bg-blue-500 rounded-full w-fit";
		case "notify":
			return "text-center";
		default:
			break;
	}
};

const connect = (id: string) => {
	handleConnectButtonClick(id);
	currentConnect.value = id;
	openInner.value = true;
	readAllMessage();
};

const message = ref<string | undefined>(undefined);

const messageFilterById = computed(() => {
	return messages.value.filter((message) => {
		return message.id === currentConnect.value;
	});
});

const messageUnreadCounts = (id: string) => {
	return messages.value.filter((message) => {
		return message.id === id && message.type !== "notify" && !message.read;
	}).length;
};

const readAllMessage = () => {
	messageFilterById.value.forEach((message) => {
		message.read = true;
	});
};
const sendMessage = () => {
	handleSendMessageButtonClick(message.value);
	message.value = "";
};

const OpenMessage = () => {
	openOuter.value = true;
};
</script>

<style></style>
