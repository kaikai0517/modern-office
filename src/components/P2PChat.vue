<template>
	<!-- P2P聊天室 -->
	<n-drawer
		:show="openOuter"
		:width="DRAWERWIDTH"
		:placement="placement"
		@MaskClick="close"
	>
		<n-drawer-content title="Messenger">
			<!-- 在線人物列表 -->
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
						<!-- 未讀訊息 -->
						<n-badge :value="messageUnreadCounts(item.WebRTCId)"> </n-badge>
					</div>
				</n-list-item>
			</n-list>
		</n-drawer-content>
	</n-drawer>
	<!-- 訊息列表 -->
	<n-drawer
		v-model:show="openInner"
		:width="DRAWERWIDTH"
		:placement="placement"
	>
		<n-drawer-content :title="currentConnectID" :native-scrollbar="false">
			<n-list :show-divider="false">
				<n-list-item v-for="item in messageFilterById" :key="item.message">
					<div :class="messageStyle(item.type)">{{ item.message }}</div>
				</n-list-item>
			</n-list>
			<template #footer>
				<div class="flex w-full gap-2">
					<!-- 輸入文字 -->
					<n-input
						v-model:value="message"
						autosize
						type="textarea"
						placeholder="請輸入文字"
						@blur="isTyping = false"
						@focus="isTyping = true"
					/><NButton type="error" @click="sendMessage"> Send </NButton>
				</div>
			</template>
		</n-drawer-content>
	</n-drawer>
</template>

<script setup lang="ts">
import {
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

interface Props {
	openOuter: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
	(e: "close"): void;
}>();

const DRAWERWIDTH = 502;
const placement = ref<DrawerPlacement>("right");

/**
 * SocketStore
 */
const socketStore = useSocketStore();
const { remotePlayerMap, isTyping } = storeToRefs(socketStore);

/**
 * WebRTCStore
 */
const webRTCStore = useWebRTCStore();
const { handleConnectButtonClick, handleSendMessageButtonClick } = webRTCStore;
const { messages } = storeToRefs(webRTCStore);

/**
 * 連接聊天室遠端ID
 */
const currentConnectID = ref<string | undefined>(undefined);

/**
 * 在線人物陣列
 */
const MessagePlayerArr = computed(() => {
	let arr = [];
	for (const [key, value] of remotePlayerMap.value.entries()) {
		arr.push(value);
	}
	return arr;
});

/**
 * 開啟聊天室
 */
const openInner = ref(false);

/**
 * 訊息樣式
 */
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

/**
 *  注入當前對象ID
 */
const setCurrentID = (id: string) => {
	currentConnectID.value = id;
};

/**
 *  開啟聊天室
 */
const openChat = () => {
	openInner.value = true;
};

/**
 *  連線相關行為
 */
const connect = (id: string) => {
	handleConnectButtonClick(id);
	setCurrentID(id);
	openChat();
	readAllMessage();
};

/**
 *  WebRTC訊息
 */
const message = ref<string | undefined>(undefined);

/**
 *  篩選當前對象訊息
 */
const messageFilterById = computed(() => {
	return messages.value.filter((message) => {
		return message.id === currentConnectID.value;
	});
});

/**
 *  未讀訊息數量
 */
const messageUnreadCounts = (id: string) => {
	return messages.value.filter((message) => {
		return message.id === id && message.type !== "notify" && !message.read;
	}).length;
};

/**
 *  已讀訊息
 */
const readAllMessage = () => {
	messageFilterById.value.forEach((message) => {
		message.read = true;
	});
};

/**
 *  WebRTC送出訊息
 */
const sendMessage = () => {
	handleSendMessageButtonClick(message.value);
	message.value = "";
};

/**
 *  點擊遮罩callback
 */
const close = () => {
	emit("close");
};
</script>

<style></style>
