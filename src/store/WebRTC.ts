import { defineStore } from "pinia";
import { Peer, DataConnection, MediaConnection } from "peerjs";
import { useSocketStore } from "../store/Socket";
import { storeToRefs } from "pinia";

export const useWebRTCStore = defineStore("WebRTC", () => {
	const peer = ref<Peer | undefined>(undefined);

	const socketStore = useSocketStore();
	const { localPlayer } = storeToRefs(socketStore);
	const { sendPlayer } = socketStore;
	const localStream = ref();
	const isConnect = ref(false);
	const messages = ref<Array<string>>([]);
	const currentConnection = ref<DataConnection | undefined>(undefined);
	const localVideo = ref<HTMLVideoElement | undefined>(undefined);
	const remoteVideo = ref<HTMLVideoElement | undefined>(undefined);
	const currentCall = ref<MediaConnection | undefined>(undefined);

	// 監聽 peer 開啟通道
	const handleOpen = (id: string) => {
		localPlayer.value.WebRTCId = id;
	};

	// 監聽 peer 資料連線開啟
	const handleDataConnectionOpen = () => {
		messages.value.push(
			`已與遠端 ${currentConnection.value?.peer} 進行資料連線`
		);
	};

	// 監聽 peer 資料連線接收到的資訊
	const handleDataConnectionData = (data: unknown, context?: any) => {
		messages.value.push(`${currentConnection.value?.peer}: ${data}`);
	};

	// 監聽 peer 通話連線接收到的串流
	const handleMediaConnectStream = (stream: MediaStream, context?: any) => {
		messages.value.push(
			`已與遠端 ${currentConnection.value?.peer} 進行通話連線`
		);

		if (remoteVideo.value) {
			remoteVideo.value.srcObject = stream;
			remoteVideo.value
				.play()
				.then(() => {})
				.catch(() => {});
		}
	};

	// 監聽 peer 通話連線結束
	const handleMediaConnectClose = () => {
		messages.value.push(`已與遠端 ${currentCall.value?.peer} 結束通話`);
	};

	// 監聽 peer 資料連線
	const handleConnection = (connection: DataConnection) => {
		currentConnection.value = connection;
		connection.on("open", handleDataConnectionOpen);
		connection.on("data", handleDataConnectionData);
	};

	const getLocalMedia = async () => {
		// 獲取我的視訊
		const stream = await navigator.mediaDevices.getUserMedia({
			video: true,
			audio: true,
		});

		if (localVideo.value) {
			localVideo.value.srcObject = stream;
			localVideo.value
				.play()
				.then(() => {})
				.catch(() => {});
		}
		localStream.value = stream;
	};

	// 監聽 peer 通話連線
	const handleMediaConnection = async (connection: MediaConnection) => {
		isConnect.value = true;
		// 儲存連線
		currentCall.value = connection;

		// 接受通話
		connection.answer(localStream.value);

		// 監聽通話連線狀態
		connection.on("stream", handleMediaConnectStream);
		connection.on("close", handleMediaConnectClose);
		connection.on("iceStateChanged", (state) => {
			if (state == "disconnected") {
				isConnect.value = false;
			}
		});
	};

	// 監聽連線按鈕點擊
	const handleConnectButtonClick = (id: string) => {
		const dataConnection = peer.value?.connect(id);
		if (dataConnection) {
			handleConnection(dataConnection);
		}
	};

	// 監聽發送訊息按鈕點擊
	const handleSendMessageButtonClick = (message: unknown) => {
		if (currentConnection.value) {
			currentConnection.value.send(message);
			messages.value.push(`已發送訊息 ${message}`);
		} else {
			messages.value.push(`尚未進行連線`);
		}
	};

	// 監聽視訊通話按鈕點擊
	const handleCallButtonClick = async (id: string) => {
		if (isConnect.value) return;
		isConnect.value = true;

		// 與遠端進行通話
		currentCall.value = peer.value?.call(id, localStream.value);
		currentCall.value?.on("stream", handleMediaConnectStream);
		currentCall.value?.on("close", handleMediaConnectClose);
	};

	// 監聽結束通話按鈕點擊
	const handleEndCallButtonClick = () => {
		isConnect.value = false;
		currentCall.value?.close();
	};

	// 建立 peer 實體
	const createPeer = async () => {
		peer.value = new Peer();
		await getLocalMedia();
		peer.value.on("open", handleOpen);
		peer.value.on("connection", handleConnection);
		peer.value.on("call", handleMediaConnection);
	};

	// 銷毀 peer 實體
	const destroyPeer = () => {
		peer.value?.destroy();
	};

	return {
		createPeer,
		destroyPeer,
		handleEndCallButtonClick,
		handleCallButtonClick,
		remoteVideo,
		localVideo,
		currentConnection,
		isConnect,
		currentCall,
	};
});
