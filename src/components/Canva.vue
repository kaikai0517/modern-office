<template>
	<div class="max-w-[848px] mx-auto mb-32">
		<!-- canvas -->
		<canvas></canvas>
	</div>
</template>

<script setup lang="ts">
import { collusions } from "../data/collusions";
import { useSocketStore } from "../store/Socket";
import { storeToRefs } from "pinia";
import { useWebRTCStore } from "../store/WebRTC";
import {
	boundary,
	player,
	PlayerInfo,
	keys,
	MoveType,
	PressType,
} from "../model/schema";

/**
 * socketStore
 */
const socketStore = useSocketStore();
const { sendPlayer, injectPlayer } = socketStore;
const { localPlayer, remotePlayerMap, isTyping, SocketOn } =
	storeToRefs(socketStore);

/**
 *  webRTCStore
 */
const webRTCStore = useWebRTCStore();
const { EndCall, AnwserCall } = webRTCStore;

/**
 *  像素寬高
 */
const BLOCKWIDTH = 16;
const BLOCKHEIGHT = 16;

/**
 *  Map寬高
 */
const MAPWIDTH = 848;
const MAPHEIGHT = 480;

/**
 *  地圖圖片位置
 */
const MAPSRC = "/canva/map/map.png";

/**
 *  人物圖片位置
 */
const PERSONSRC = "/canva/person/Adam_run_16x16.png";

/**
 *  初始化地圖圖片
 */
const image = new Image();
image.src = MAPSRC;

/**
 *  初始化人物圖片
 */
const playerImage = new Image();
playerImage.src = PERSONSRC;

/**
 *  移動步數
 */
const MOVESTEPS = 3;

/**
 *  移動物件
 *  @index  0:人物朝右 1:人物朝上 2:人物朝左 3:人物朝下
 * 	@pressed 是否按著按鍵
 */
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

/**
 *  取得人物位置隨機生成亂數
 *  @max 位置象限最大
 * 	@min 位置象限最小
 */
const getRandom = (max: number, min: number) => {
	return Math.floor(Math.random() * (max - min) + min);
};

/**
 *  人物起始位置x軸
 */
const STARTWITHX = () => {
	const RANGESTART = 23;
	const RANGEEND = 27;
	return BLOCKWIDTH * getRandom(RANGEEND, RANGESTART);
};

/**
 *  人物起始位置y軸
 */
const STARTWITHY = () => {
	const RANGESTART = 5;
	const RANGEEND = 7;
	return BLOCKWIDTH * getRandom(RANGEEND, RANGESTART);
};

/**
 *  圖片裡人物數量
 */
const PERSONNUMS = 24;

/**
 *  圖片裡人物移動總次數
 */
const PERSONMOVEMENTTIMES = 6;

/**
 *  人物物件
 *  @positionX x軸位置
 * 	@positionY y軸位置
 *  @width 人物寬度
 * 	@height 人物高度
 *  @moveTimes 人物當前移動循環 (最大值為PERSONMOVEMENTTIMES)
 *  @move 人物動作 (從圖片人物數量與人物寬度去計算當前動作)
 */
const player: PlayerInfo = reactive({
	positionX: STARTWITHX(),
	positionY: STARTWITHY(),
	width: computed(() => playerImage.width / PERSONNUMS),
	height: computed(() => playerImage.height),
	currentMovement: {
		moveTimes: 0,
		/* */
		move: computed<number>(
			() =>
				(player.currentMovement.moveTimes + keys.index * PERSONMOVEMENTTIMES) *
				BLOCKWIDTH
		),
	},
});

/**
 *  判斷有沒有碰到障礙物右邊
 * 	計算： 人物X象限 + 人物寬度 有無大於障礙物X象限
 *  @param x 障礙物X象限
 */
const isTouchRight = (x: number) => player.positionX + player.width >= x;

/**
 *  判斷有沒有碰到障礙物左邊
 * 	計算： 人物X象限有無小於等於 障礙物寬度 + 障礙物X象限
 *  @param x 障礙物X象限
 */
const isTouchLeft = (x: number) => player.positionX <= BLOCKWIDTH + x;

/**
 *  判斷有沒有碰到障礙物上面
 * 	計算： 人物Y象限 + 人物高度 有無大於障礙物Y象限
 *  @param y 障礙物X象限
 */
const isTouchTop = (y: number) => player.positionY + player.height >= y;

/**
 *  判斷有沒有碰到障礙物下面
 * 	*因為人物高度較高 所以函式有更動一點
 * 	計算： 人物Y象限有無小於等於 障礙物Y象限
 *  @param y 障礙物X象限
 */
const isTouchBottom = (y: number) => player.positionY <= y;

/**
 *  判斷有沒有碰到障礙物
 *  @param boundary 障礙物位置
 */
const isTouchBoundary = (boundary: boundary) => {
	return (
		isTouchRight(boundary.x) &&
		isTouchLeft(boundary.x) &&
		isTouchTop(boundary.y) &&
		isTouchBottom(boundary.y)
	);
};

onMounted(() => {
	/**
	 *  初始化canvas
	 * 	setup內dom還未生成完畢所以抓取不到canvas
	 *  所以只能在onMounted內執行
	 */
	const canvas = document.querySelector("canvas") as HTMLCanvasElement;
	const c = canvas.getContext("2d") as CanvasRenderingContext2D;
	canvas.width = MAPWIDTH;
	canvas.height = MAPHEIGHT;

	/**
	 *  注入人物物件
	 */
	injectPlayer(player);

	/**
	 * 	設定障礙物顏色
	 * 	平時不顯示
	 *  主要用來測試
	 *  @boundary 障礙物
	 */
	// const fillBoundariesStyle = (boundary: boundary) => {
	// 	const BOUNDARIESCOLOR = "rgba(255, 0, 0,0.2)";
	// 	c.fillStyle = BOUNDARIESCOLOR;
	// 	c.fillRect(boundary.x, boundary.y, BLOCKWIDTH, BLOCKHEIGHT);
	// };

	/**
	 * 	障礙物參數
	 */
	const BOUNDARYINDEX = 628;

	/**
	 * 	將障礙物陣列切分成地圖形狀
	 */
	const cutBoundariesMap = () => {
		const collusionsMap = [];
		const COLS = 53;
		for (let i = 0; i < collusions.length; i += COLS) {
			collusionsMap.push(collusions.slice(i, COLS + i));
		}
		return collusionsMap;
	};

	/**
	 * 	取得障礙物位置
	 */
	const getBoundaries = () => {
		const boundaries: Array<boundary> = [];
		cutBoundariesMap().forEach((row, i) => {
			row.forEach((item, j) => {
				if (item === BOUNDARYINDEX) {
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

	/**
	 * 	設定人物名字樣式
	 *  @name	人物名字
	 *  @player 人物物件
	 */
	const setPlayerNameStyle = (name: string, player: PlayerInfo) => {
		const FONTSTYLE = "10px Georgia ";
		const TEXTSTYLE = "black";
		const ONLINEDOTSTYLE = "#90ee90";

		// 設定文字
		c.font = FONTSTYLE;
		c.fillStyle = TEXTSTYLE;
		c.fillText(name, player.positionX + 7, player.positionY + 5);

		// 設定燈號
		c.beginPath();
		c.arc(player.positionX, player.positionY + 2, 3, 0, 2 * Math.PI);
		c.closePath();
		c.fillStyle = ONLINEDOTSTYLE;
		c.fill();
	};

	/**
	 * 	更動本地人物
	 */
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
		setPlayerNameStyle(localPlayer.value.name, player);
	};

	/**
	 * 	取得所有遠端人物
	 */
	const getRemotePlayer = () => {
		remotePlayerMap.value.forEach((value: player) => {
			changeRemotePlayer(value.image, value.player, value.name);
		});
	};

	/**
	 * 	更動遠端人物
	 *  @name	人物名字
	 *  @player 人物物件
	 *	@image 人物圖片
	 */
	const changeRemotePlayer = (
		image: HTMLImageElement,
		player: PlayerInfo,
		name: string
	) => {
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
		setPlayerNameStyle(name, player);
	};

	/**
	 * 	是否現在動作為動作循環結束
	 */
	const isMoveEnd = computed(
		() => player.currentMovement.moveTimes === PERSONMOVEMENTTIMES
	);

	/**
	 * 	移動動畫
	 * 	@PERSONMOVEMENTTIMES 動作數量為一循環
	 */
	const moveAnimation = () => {
		player.currentMovement.moveTimes++;
		if (isMoveEnd.value) {
			player.currentMovement.moveTimes = 0;
		}
	};

	/**
	 * 	當玩家圖片生成再去觸發動畫
	 */
	playerImage.onload = () => {
		animate();
	};

	/**
	 * 	觸發瀏覽器repaint interval行為
	 * 	利用固定時間repaint去達到動畫效果
	 */
	const animate = () => {
		window.requestAnimationFrame(animate);
		c.drawImage(image, 0, 0);
		changeLocalPlayer();
		getRemotePlayer();
		handleKeydown();
		// getBoundaries().forEach((boundary) => {
		// 	fillBoundariesStyle(boundary);
		// });
	};

	/**
	 *  移動方向參數
	 *  0:人物朝右 1:人物朝上 2:人物朝左 3:人物朝下
	 */
	const KEYRIGHTINDEX = 0;
	const KEYUPINDEX = 1;
	const KEYLEFTINDEX = 2;
	const KEYDOWNINDEX = 3;

	/**
	 *  判斷當下有沒有碰到障礙物
	 *  @param x 人物象限x
	 * 	@param y 人物象限y
	 */
	const hasTouchBoundary = (x: number, y: number): Boolean => {
		let moving = true;
		getBoundaries().forEach((boundary) => {
			if (isTouchBoundary({ x: boundary.x + x, y: boundary.y + y })) {
				moving = false;
			}
		});
		return moving;
	};

	/**
	 *  判斷當下有沒有碰到人物
	 *  @param x 人物象限x
	 * 	@param y 人物象限y
	 * 	@return WebRTCId
	 */
	const hasTouchPerson = (x: number, y: number): string => {
		let personWebRTCId = "";
		remotePlayerMap.value.forEach(
			({ player, WebRTCId }: { player: PlayerInfo; WebRTCId: string }) => {
				if (
					isTouchBoundary({
						x: player.positionX + x,
						y: player.positionY + y,
					})
				) {
					personWebRTCId = WebRTCId;
				}
			}
		);
		return personWebRTCId;
	};

	/**
	 *  注入當前方向移動參數
	 *  @param index 方向移動參數
	 */
	const setIndex = (index: number) => (keys.index = index);

	/**
	 *  注入人物物件
	 * 	socket送出人物
	 * 	觸發動作動畫
	 */
	const move = () => {
		injectPlayer(player);
		sendPlayer();
		moveAnimation();
	};

	/**
	 *  注入參數
	 * 	移動人物位置
	 *  @param type 方向
	 */
	const handleMoveSteps = (type: MoveType) => {
		switch (type) {
			case "UP":
				setIndex(KEYUPINDEX);
				player.positionY -= MOVESTEPS;
				break;
			case "LEFT":
				setIndex(KEYLEFTINDEX);
				player.positionX -= MOVESTEPS;
				break;
			case "DOWN":
				setIndex(KEYDOWNINDEX);
				player.positionY += MOVESTEPS;
				break;
			case "RIGHT":
				setIndex(KEYRIGHTINDEX);
				player.positionX += MOVESTEPS;
				break;
		}
	};

	/**
	 *  運作移動相關行為
	 *  @param x 人物x象限
	 *  @param y 人物y象限
	 *  @param type 方向
	 */
	const handleMove = (x: number, y: number, type: MoveType) => {
		const canMove = hasTouchBoundary(x, y) && SocketOn.value;
		const touchPersonWebRTCId = hasTouchPerson(x, y);
		touchPersonWebRTCId ? AnwserCall(touchPersonWebRTCId) : EndCall();
		if (canMove) {
			handleMoveSteps(type);
			move();
		}
	};

	/**
	 *  移動
	 */
	const handleKeydown = () => {
		if (keys.up.pressed) {
			handleMove(0, MOVESTEPS, "UP");
		} else if (keys.left.pressed) {
			handleMove(MOVESTEPS, 0, "LEFT");
		} else if (keys.down.pressed) {
			handleMove(0, -MOVESTEPS, "DOWN");
		} else if (keys.right.pressed) {
			handleMove(-MOVESTEPS, 0, "RIGHT");
		}
	};

	/**
	 *  判斷是否為按下
	 *  @param type 按下或放開
	 */
	const isKeyDown = (type: PressType) => {
		return type === "keydown" ? true : false;
	};

	/**
	 *  WASD按鍵handle
	 *  @param key w a s d
	 *  @param type 按下或放開
	 */
	const UseWASD = (key: string, type: PressType) => {
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

	/**
	 *  上下左右按鍵handle
	 *  @param keyCode 38 40 37 39(上下左右)
	 *  @param type 按下或放開
	 */
	const UseUPDOWNLEFTRIGHT = (keyCode: number, type: PressType) => {
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

	/**
	 *  監聽按鍵按下
	 *  @isTyping 是否輸入中 以免跟人物移動判定衝突
	 */
	window.addEventListener("keydown", (e) => {
		if (!isTyping.value) {
			e.preventDefault();
			UseWASD(e.key, "keydown");
			UseUPDOWNLEFTRIGHT(e.keyCode, "keydown");
		}
	});

	/**
	 *  監聽按鍵放開
	 */
	window.addEventListener("keyup", (e) => {
		UseWASD(e.key, "keyup");
		UseUPDOWNLEFTRIGHT(e.keyCode, "keyup");
	});
});
</script>

<style scoped></style>
