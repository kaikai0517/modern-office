<template>
	<div class="text-white w-[400px] group">
		<div
			ref="chat"
			class="pt-3 px-3 pb-6 group-hover:border-solid group-hover:border-[1px] group-hover:border-white h-[150px] opacity-50 group-hover:opacity-100 overflow-hidden group-hover:overflow-auto"
		>
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
			<n-input
				v-model:value="message"
				autosize
				type="textarea"
				placeholder="請輸入文字"
				@blur="isTypingName = false"
				@focus="isTypingName = true"
			/><NButton type="error" @click="send"> Send </NButton>
		</div>
	</div>
</template>

<script setup lang="ts">
import { NButton, NInput } from "naive-ui";
import { storeToRefs } from "pinia";
import { useSocketStore } from "../store/Socket";

const message = ref("");

const chat = ref();

// socketStore
const socketStore = useSocketStore();
const { isTypingName, messages } = storeToRefs(socketStore);
const { sendAllMessages, isLocal } = socketStore;

const send = () => {
	sendAllMessages(message.value);
	message.value = "";
};

watch(messages.value, () => {
	if (chat.value) {
		chat.value.scrollTop = chat.value.scrollHeight;
	}
});
</script>

<style></style>
