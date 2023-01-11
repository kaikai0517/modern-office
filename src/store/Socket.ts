import { defineStore } from "pinia";
import { v4 as uuidv4 } from "uuid";
import { useMessage } from "naive-ui";
import { SocketMessage, PlayerInfo } from "../model/schema";

export const useSocketStore = defineStore("socket", () => {
	interface player {
		id: string;
		WebRTCId: string;
		onLine: boolean;
		name: string;
		player: PlayerInfo;
	}

	const message = useMessage();

	/**
	 * 建立socket
	 */
	const ws = new WebSocket("wss://modern-office-api.onrender.com");

	/**
	 * 本地人物
	 */
	const localPlayer = ref<player>({
		id: "",
		WebRTCId: "",
		onLine: false,
		name: "陌生人",
		player: {
			positionX: 0,
			positionY: 0,
			width: 0,
			height: 0,
			currentMovement: {
				move: 0,
				moveTimes: 0,
			},
		},
	});

	/**
	 * 遠端人物
	 */
	const remotePlayers = ref<Array<player>>([]);

	/**
	 * socket訊息
	 */
	const messages = ref<Array<SocketMessage>>([]);

	/**
	 * 人物是否離線
	 */
	const onLine = ref(true);

	/**
	 * socket是否開啟
	 */
	const SocketOn = ref(false);

	/**
	 * 人物圖片位置
	 */
	const PERSONSRC = "/canva/person/Adam_run_16x16.png";

	/**
	 * 遠端人物Map
	 */
	const remotePlayerMap = ref();
	remotePlayerMap.value = new Map();

	/**
	 * 是否在輸入訊息
	 */
	const isTyping = ref(false);

	/**
	 * 監聽socket開啟
	 */
	ws.onopen = async () => {
		setPlayerId();
		sentLoginMessage();
		sendPlayer();
		SocketOn.value = true;
		console.log("open connection");
	};

	/**
	 * 監聽socket關閉
	 */
	ws.onclose = () => {
		SocketOn.value = false;
		console.log("close connection");
	};

	/**
	 * 注入人物UUID
	 */
	const setPlayerId = () => {
		localPlayer.value.id = uuidv4();
	};

	/**
	 * 發送登入訊息
	 */
	const sentLoginMessage = () => {
		ws.send(JSON.stringify({ login: `${localPlayer.value.id} Login` }));
	};

	/**
	 * 離線
	 */
	const OffLine = () => {
		onLine.value = false;
		sendPlayer();
	};

	/**
	 * 網頁關閉或重整監聽
	 */
	window.onbeforeunload = () => {
		OffLine();
	};

	/**
	 * 判斷是不是本地用戶
	 */
	const isLocal = (id: string) => id === localPlayer.value.id;

	/**
	 * 更改已存在人物資訊
	 */
	const setCurrentPlayer = (currentPlayer: player) => {
		remotePlayerMap.value.set(currentPlayer.id, {
			image: remotePlayerMap.value.get(currentPlayer.id).image,
			...currentPlayer,
		});
	};

	/**
	 * 新增遠端人物
	 */
	const setNewPlayer = (newPlayer: player) => {
		const image = new Image();
		image.src = PERSONSRC;
		remotePlayerMap.value.set(newPlayer.id, {
			image: image,
			...newPlayer,
		});
	};

	/**
	 * 設定人物相關流程
	 */
	const setPlayer = (player: player) => {
		if (isLocal(player.id)) {
			return;
		} else if (!player.onLine) {
			remotePlayerMap.value.delete(player.id);
			message.error(`${player.id} Logout`, { keepAliveOnHover: true });
		} else if (!remotePlayerMap.value.has(player.id)) {
			setNewPlayer(player);
		} else {
			setCurrentPlayer(player);
		}
	};

	/**
	 * 注入人物資訊
	 */
	const injectPlayer = (player: PlayerInfo) => {
		localPlayer.value.player = player;
	};

	/**
	 * 送出人物
	 */
	const sendPlayer = () => {
		const data = JSON.stringify({
			...localPlayer.value,
			onLine: onLine.value,
		});
		ws.send(data);
	};

	/**
	 * 發送全頻聊天室訊息
	 */
	const sendAllMessages = (message: string) => {
		ws.send(
			JSON.stringify({
				message,
				name: localPlayer.value.name,
				id: localPlayer.value.id,
			})
		);
	};

	/**
	 * 監聽socket訊息
	 */
	const handleSocketMessage = () => {
		//接收 Server 發送的訊息
		ws.onmessage = (event) => {
			const reader = new FileReader();

			reader.readAsText(event.data, "utf-8");

			reader.onload = function (e) {
				if (typeof reader.result === "string") {
					const data = JSON.parse(reader.result);
					if (data.login) {
						sendPlayer();
						message.success(data.login, { keepAliveOnHover: true });
					} else if (data.message) {
						messages.value.push(data);
					} else {
						setPlayer(data);
					}
				}
			};
		};
	};

	return {
		sendPlayer,
		sentLoginMessage,
		OffLine,
		handleSocketMessage,
		sendAllMessages,
		isLocal,
		injectPlayer,
		localPlayer,
		remotePlayers,
		remotePlayerMap,
		isTyping,
		SocketOn,
		messages,
	};
});
