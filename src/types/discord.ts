import { Message } from 'discord.js';

export interface DiscordMessage extends Message {
	[x: string]: any;
}
