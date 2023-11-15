import { EventEmitter } from 'events';


export interface Message {
	timestamp: number;
	author: string;
	textContent: string;

}

export interface StandardizedMessage {
	author: string;
	timestamp: number,
	textContent: string;
}

export interface SendMessageEvent {
	message: StandardizedMessage;
}

export interface TgSendMessageEvent extends SendMessageEvent {
	receivingUsersIds: string[];
}


// we have file path and authors name

export interface SendEmbedEvent {
	caption: string;
	filepath: string;
	timestamp: number;
}

export interface TgSendEmbedEvent extends SendEmbedEvent {
	receivingUsersIds: string[];
}

export interface BetaEmitter extends EventEmitter { }