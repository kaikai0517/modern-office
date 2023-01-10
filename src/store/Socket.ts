import { defineStore } from "pinia";
import { v4 as uuidv4 } from "uuid";
import { useMessage } from "naive-ui";
import { SocketMessage } from "../model/schema";

export const useSocketStore = defineStore("socket", () => {
	interface player {
		id: string;
		WebRTCId: string;
		onLine: boolean;
		name: string;
		player: {
			positionX: number;
			positionY: number;
			width: number;
			height: number;
		};
	}

	const message = useMessage();

	const ws = new WebSocket("wss://modern-office-api.onrender.com");
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
		},
	});
	const remotePlayers = ref<Array<player>>([]);

	const messages = ref<Array<SocketMessage>>([]);

	const onLine = ref(true);

	const SocketOn = ref(false);

	// 人物圖片位置
	const PERSONSRC = "/canva/person/Adam_run_16x16.png";

	const remotePlayerMap = ref();
	remotePlayerMap.value = new Map();

	const isTypingName = ref(false);

	ws.onopen = async () => {
		setPlayerId();
		sentLoginMessage();
		sendPlayer();
		SocketOn.value = true;
		console.log("open connection");
	};

	ws.onclose = () => {
		SocketOn.value = false;
		console.log("close connection");
	};

	const setPlayerId = () => {
		localPlayer.value.id = uuidv4();
	};

	const sentLoginMessage = () => {
		ws.send(JSON.stringify({ login: `${localPlayer.value.id} Login` }));
	};

	const OffLine = () => {
		onLine.value = false;
		sendPlayer();
	};

	window.onbeforeunload = () => {
		OffLine();
	};

	const isLocal = (id: string) => id === localPlayer.value.id;

	const setCurrentPlayer = (currentPlayer: player) => {
		remotePlayerMap.value.set(currentPlayer.id, {
			image: remotePlayerMap.value.get(currentPlayer.id).image,
			...currentPlayer,
		});
	};

	const setNewPlayer = (newPlayer: player) => {
		const image = new Image();
		image.src = PERSONSRC;
		remotePlayerMap.value.set(newPlayer.id, {
			image: image,
			...newPlayer,
		});
	};

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

	const sendPlayer = () => {
		const data = JSON.stringify({
			...localPlayer.value,
			onLine: onLine.value,
		});
		ws.send(data);
	};

	const sendAllMessages = (message: string) => {
		ws.send(
			JSON.stringify({
				message,
				name: localPlayer.value.name,
				id: localPlayer.value.id,
			})
		);
	};

	const handleMessage = () => {
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
		handleMessage,
		sendAllMessages,
		isLocal,
		localPlayer,
		remotePlayers,
		remotePlayerMap,
		isTypingName,
		SocketOn,
		messages,
	};
});
