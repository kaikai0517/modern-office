<template>
	<div class="text-white w-[400px] group">
		<div
			ref="chat"
			class="pt-3 px-3 pb-6 group-hover:border-solid group-hover:border-[1px] group-hover:border-white h-[150px] opacity-50 group-hover:opacity-100 overflow-hidden group-hover:overflow-auto"
		>
			<!-- 全頻聊天室 -->
			<div
				:class="isLocal(item.id) ? 'text-right' : 'text-left text-yellow-200'"
				v-for="item in messages"
				:key="item.id"
			>
				{{ `${item.name} : ${item.message}` }}
			</div>
		</div>
		<div
			class="flex w-full border-[1px] border-white border-solid items-center"
		>
			<!-- 輸入匡 -->
			<n-input
				v-model:value="message"
				autosize
				type="textarea"
				placeholder="請輸入文字"
				@blur="isTyping = false"
				@focus="isTyping = true"
			/><NButton type="error" @click="send"> Send </NButton>
		</div>
	</div>
</template>

<script setup lang="ts">
import { NButton, NInput } from "naive-ui";
import { storeToRefs } from "pinia";
import { useSocketStore } from "../store/Socket";

/**
 * 送出文字
 */
const message = ref("");

/**
 * 聊天室div
 */
const chat = ref();

/**
 * socketStore
 */
const socketStore = useSocketStore();
const { isTyping, messages } = storeToRefs(socketStore);
const { sendAllMessages, isLocal } = socketStore;

/**
 * 送出全頻聊天室
 */
const send = () => {
	sendAllMessages(message.value);
	message.value = "";
};

/**
 * 有新訊息就讓聊天室scroll在最底部
 */
watch(messages.value, () => {
	if (chat.value) {
		chat.value.scrollTop = chat.value.scrollHeight;
	}
});
</script>

<style></style>
