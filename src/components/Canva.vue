<template>
	<div class="max-w-[848px] mx-auto mb-32">
		<canvas></canvas>
	</div>
</template>

<script setup lang="ts">
// 障礙物json檔
import { collusions } from "../data/collusions";
import { useSocketStore } from "../store/Socket";
import { storeToRefs } from "pinia";
import { useWebRTCStore } from "../store/WebRTC";

// socketStore
const socketStore = useSocketStore();
const { sendPlayer } = socketStore;
const { localPlayer, remotePlayerMap, isTypingName } = storeToRefs(socketStore);

// webRTCStore
const webRTCStore = useWebRTCStore();
const { handleEndCallButtonClick, handleCallButtonClick } = webRTCStore;

interface boundary {
	x: number;
	y: number;
}

interface movement {
	pressed: boolean;
}

interface Player {
	positionX: number;
	positionY: number;
	width: number;
	height: number;
	currentMovement: {
		moveTimes: number;
		move: number;
	};
}

interface player {
	id: string;
	WebRTCId: string;
	onLine: boolean;
	image: HTMLImageElement;
	name: string;
	player: Player;
}

interface keys {
	index: number;
	up: movement;
	left: movement;
	down: movement;
	right: movement;
}

// 像素寬高
const BLOCKWIDTH = 16;
const BLOCKHEIGHT = 16;
// Map寬高
const MAPWIDTH = 848;
const MAPHEIGHT = 480;

// 地圖圖片位置
const MAPSRC = "/canva/map/map.png";
// 人物圖片位置
const PERSONSRC = "/canva/person/Adam_run_16x16.png";

// 新增地圖
const image = new Image();
image.src = MAPSRC;

// 新增人物
const playerImage = new Image();
playerImage.src = PERSONSRC;

// 移動控制物件
const keys: keys = reactive({
	index: 3,
	up: {
		pressed: false,
	},
	left: {
		pressed: false,
	},
	down: {
		pressed: false,
	},
	right: {
		pressed: false,
	},
});

// 圖片裡人物移動總次數
const PERSONMOVEMENTTIMES = 6;

const getRandom = (max: number, min: number) => {
	return Math.floor(Math.random() * (max - min) + min);
};

// 人物起始位置
const STARTWITHX = () => {
	const RANGESTART = 23;
	const RANGEEND = 27;
	return BLOCKWIDTH * getRandom(RANGEEND, RANGESTART);
};

const STARTWITHY = () => {
	const RANGESTART = 5;
	const RANGEEND = 7;
	return BLOCKWIDTH * getRandom(RANGEEND, RANGESTART);
};

// 圖片裡人物數量
const PERSONNUMS = 24;
// 人物物件
const player: Player = reactive({
	positionX: STARTWITHX(),
	positionY: STARTWITHY(),
	width: playerImage.width / PERSONNUMS,
	height: playerImage.height,
	currentMovement: {
		moveTimes: 0,
		move: computed<number>(
			() =>
				(player.currentMovement.moveTimes + keys.index * PERSONMOVEMENTTIMES) *
				BLOCKWIDTH
		),
	},
});

const isTouchRight = (x: number) => player.positionX + player.width >= x;

const isTouchLeft = (x: number) => player.positionX <= BLOCKWIDTH + x;

const isTouchTop = (y: number) => player.positionY + player.height >= y;

const isTouchBottom = (y: number) => player.positionY <= y + BLOCKHEIGHT;

// 判斷有沒有碰到障礙物
const isTouchBoundary = (boundary: boundary) => {
	return (
		isTouchRight(boundary.x) &&
		isTouchLeft(boundary.x) &&
		isTouchTop(boundary.y) &&
		isTouchBottom(boundary.y)
	);
};

watch(player, () => {
	localPlayer.value.player = player;
	sendPlayer();
});

onMounted(() => {
	// 初始化canvas
	const canvas = document.querySelector("canvas") as HTMLCanvasElement;
	const c = canvas.getContext("2d") as CanvasRenderingContext2D;
	canvas.width = MAPWIDTH;
	canvas.height = MAPHEIGHT;

	localPlayer.value.player = player;

	// 設定障礙物顏色 *用來檢查位置,平時不顯示
	const fillBoundariesStyle = (boundary: boundary) => {
		const BOUNDARIESCOLOR = "rgba(255, 0, 0,0.2)";
		c.fillStyle = BOUNDARIESCOLOR;
		c.fillRect(boundary.x, boundary.y, BLOCKWIDTH, BLOCKHEIGHT);
	};

	// 取得障礙物位置
	const getBoundaries = () => {
		const boundaries: Array<boundary> = [];
		cutBoundariesMap().forEach((row, i) => {
			row.forEach((item, j) => {
				if (item === 100) {
					const boundary = {
						x: j * BLOCKWIDTH,
						y: i * BLOCKHEIGHT,
					};
					boundaries.push(boundary);
				}
			});
		});
		return boundaries;
	};

	// 將障礙物map切分成地圖形狀
	const cutBoundariesMap = () => {
		const collusionsMap = [];
		const COLS = 53;
		for (let i = 0; i < collusions.length; i += COLS) {
			collusionsMap.push(collusions.slice(i, COLS + i));
		}
		return collusionsMap;
	};

	// 更動本地人物
	const changeLocalPlayer = () => {
		c.drawImage(
			playerImage,
			player.currentMovement.move,
			0,
			player.width,
			player.height,
			player.positionX,
			player.positionY,
			player.width,
			player.height
		);
		c.font = "10px Georgia ";
		c.fillStyle = "black";
		c.fillText(
			localPlayer.value.name,
			player.positionX + 7,
			player.positionY + 5
		);
		c.beginPath();
		c.arc(player.positionX, player.positionY + 2, 3, 0, 2 * Math.PI);
		c.closePath();
		c.fillStyle = "#90ee90";
		c.fill();
	};

	const getRemotePlayer = () => {
		remotePlayerMap.value.forEach((value: player) => {
			changeRemotePlayer(value.image, value.player, value.name);
		});
	};

	// 更動遠端人物
	const changeRemotePlayer = (
		image: HTMLImageElement,
		player: Player,
		name: string
	) => {
		if (image) {
			c.drawImage(
				image,
				player.currentMovement.move,
				0,
				player.width,
				player.height,
				player.positionX,
				player.positionY,
				player.width,
				player.height
			);
		}
		c.font = "10px Georgia ";
		c.fillStyle = "black";
		c.fillText(name, player.positionX + 7, player.positionY + 5);
		c.beginPath();
		c.arc(player.positionX, player.positionY + 2, 3, 0, 2 * Math.PI);
		c.closePath();
		c.fillStyle = "#90ee90";
		c.fill();
	};

	// 移動動畫
	const moveAnimation = () => {
		player.currentMovement.moveTimes++;
		if (player.currentMovement.moveTimes === PERSONMOVEMENTTIMES)
			player.currentMovement.moveTimes = 0;
	};

	// 觸發瀏覽器repaint
	const animate = () => {
		window.requestAnimationFrame(animate);
		c.drawImage(image, 0, 0);
		changeLocalPlayer();
		getRemotePlayer();
		getBoundaries().forEach((boundary) => {
			fillBoundariesStyle(boundary);
		});
		move();
	};

	const KEYUPINDEX = 1;
	const KEYLEFTINDEX = 2;
	const KEYDOWNINDEX = 3;
	const KEYRIGHTINDEX = 0;

	const handleMoveUp = () => {
		let moving = true;
		keys.index = KEYUPINDEX;
		getBoundaries().forEach((boundary) => {
			if (isTouchBoundary({ x: boundary.x, y: boundary.y + 3 })) {
				moving = false;
			}
		});
		remotePlayerMap.value.forEach(
			({ player, WebRTCId }: { player: Player; WebRTCId: string }) => {
				if (isTouchBoundary({ x: player.positionX, y: player.positionY + 3 })) {
					if (WebRTCId) handleCallButtonClick(WebRTCId);
				} else {
					handleEndCallButtonClick();
				}
			}
		);

		if (moving) {
			moveAnimation();
			player.positionY -= 3;
		}
	};
	const handleMoveLeft = () => {
		let moving = true;
		keys.index = KEYLEFTINDEX;
		getBoundaries().forEach((boundary) => {
			if (isTouchBoundary({ x: boundary.x + 3, y: boundary.y })) {
				moving = false;
			}
		});
		remotePlayerMap.value.forEach(
			({ player, WebRTCId }: { player: Player; WebRTCId: string }) => {
				if (isTouchBoundary({ x: player.positionX + 3, y: player.positionY })) {
					if (WebRTCId) handleCallButtonClick(WebRTCId);
				} else {
					handleEndCallButtonClick();
				}
			}
		);
		if (moving) {
			moveAnimation();
			player.positionX -= 3;
		}
	};
	const handleMoveDown = () => {
		let moving = true;
		keys.index = KEYDOWNINDEX;
		getBoundaries().forEach((boundary) => {
			if (isTouchBoundary({ x: boundary.x, y: boundary.y - 3 })) {
				moving = false;
			}
		});
		remotePlayerMap.value.forEach(
			({ player, WebRTCId }: { player: Player; WebRTCId: string }) => {
				if (isTouchBoundary({ x: player.positionX, y: player.positionY - 3 })) {
					if (WebRTCId) handleCallButtonClick(WebRTCId);
				} else {
					handleEndCallButtonClick();
				}
			}
		);

		if (moving) {
			moveAnimation();
			player.positionY += 3;
		}
	};
	const handleMoveRight = () => {
		let moving = true;
		keys.index = KEYRIGHTINDEX;
		getBoundaries().forEach((boundary) => {
			if (isTouchBoundary({ x: boundary.x - 3, y: boundary.y })) {
				moving = false;
			}
		});

		remotePlayerMap.value.forEach(
			({ player, WebRTCId }: { player: Player; WebRTCId: string }) => {
				if (isTouchBoundary({ x: player.positionX + 3, y: player.positionY })) {
					if (WebRTCId) handleCallButtonClick(WebRTCId);
				} else {
					handleEndCallButtonClick();
				}
			}
		);
		if (moving) {
			moveAnimation();
			player.positionX += 3;
		}
	};
	// 移動
	const move = () => {
		if (keys.up.pressed) {
			handleMoveUp();
		} else if (keys.left.pressed) {
			handleMoveLeft();
		} else if (keys.down.pressed) {
			handleMoveDown();
		} else if (keys.right.pressed) {
			handleMoveRight();
		}
	};

	animate();

	const isKeyDown = (type: string) => {
		return type === "keydown" ? true : false;
	};

	const UseWASD = (key: string, type: string) => {
		switch (key) {
			case "w":
				keys.up.pressed = isKeyDown(type);
				break;
			case "a":
				keys.left.pressed = isKeyDown(type);
				break;
			case "s":
				keys.down.pressed = isKeyDown(type);
				break;
			case "d":
				keys.right.pressed = isKeyDown(type);
				break;

			default:
				break;
		}
	};
	const UseUPDOWNLEFTRIGHT = (keyCode: number, type: string) => {
		switch (keyCode) {
			case 37:
				keys.left.pressed = isKeyDown(type);
				break;
			case 38:
				keys.up.pressed = isKeyDown(type);
				break;
			case 39:
				keys.right.pressed = isKeyDown(type);
				break;
			case 40:
				keys.down.pressed = isKeyDown(type);
				break;

			default:
				break;
		}
	};

	window.addEventListener("keydown", (e) => {
		if (!isTypingName.value) {
			e.preventDefault();
			UseWASD(e.key, "keydown");
			UseUPDOWNLEFTRIGHT(e.keyCode, "keydown");
		}
	});

	window.addEventListener("keyup", (e) => {
		UseWASD(e.key, "keyup");
		UseUPDOWNLEFTRIGHT(e.keyCode, "keyup");
	});
});
</script>

<style scoped></style>
