export interface player {
	id: string;
	WebRTCId: string;
	onLine: boolean;
	image: HTMLImageElement;
	name: string;
	player: PlayerInfo;
}

export interface PlayerInfo {
	positionX: number;
	positionY: number;
	width: number;
	height: number;
	currentMovement: {
		moveTimes: number;
		move: number;
	};
}

export interface boundary {
	x: number;
	y: number;
}

export interface movement {
	pressed: boolean;
}

export interface keys {
	index: number;
	up: movement;
	left: movement;
	down: movement;
	right: movement;
}

export interface WebRTCMessage {
	id: string;
	message: string;
	type: MessageType;
	read: boolean;
}

export interface SocketMessage {
	name: string;
	message: string;
	id: string;
}

export type MessageType = "local" | "remote" | "notify";
