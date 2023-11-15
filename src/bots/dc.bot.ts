import { DiscordMessage } from '../types/discord.ts';
import { SendEmbedEvent, Message, SendMessageEvent, TgSendMessageEvent, TgSendEmbedEvent, BetaEmitter } from '../types/common.ts';
import { Attachment, Client, Collection } from 'discord.js';
import { AttachmentBuilder, EmbedBuilder } from 'discord.js';

interface MessageDto extends SendMessageEvent { client: any; }
interface EmbedDto extends SendEmbedEvent { client: any; }

export class DiscordBot {
	client: Client;
	private readonly betaEmitter: BetaEmitter;
	private readonly userChatIds: string[];
	readonly test_server_channelId: string = '1159097400506454019';
	readonly karacord_b_channelId: string = '1165277765881303161';

	constructor (client: any, betaEmitter: BetaEmitter, userChatIds: string[]) {
		this.client = client;
		this.betaEmitter = betaEmitter;
		this.userChatIds = userChatIds;
	}
	processAttachments = (author: string, attachments: Collection<string, Attachment>) => {
		const processedAttachments = attachments.map((el: any) => ({ caption: `${author} wysyła bobrazek`, filepath: el.url, timestamp: Date.now() }));
		return processedAttachments;
	};

	processNewMessage = (msg: DiscordMessage) => {
		// Check if the message should be processed
		if (![this.karacord_b_channelId, this.test_server_channelId].includes(msg.channelId) || msg?.author.username === 'zak3.0') {
			return;
		}
		// Process text content
		if (msg.content && msg.content.length < 9000) {
			const standardizedMsg: Message = {
				author: msg?.author.username,
				timestamp: Date.now(),
				textContent: msg.content,
			};
			console.log('Processing Discord text message:', standardizedMsg);

			// Emit the message to Telegram
			this.betaEmitter.emit('sendTelegramMessage', { message: standardizedMsg, receivingUsersIds: [...this.userChatIds] });
		}

		if (msg.attachments) {
			const attachments = this.processAttachments(msg?.author.username, msg.attachments);
			if (attachments.length === 0) return;
			attachments.forEach((attachment: { caption: string, filepath: string; }) => {
				this.betaEmitter.emit('sendTelegramEmbed', { ...attachment, receivingUsersIds: [...this.userChatIds] });
			});
		}
	};
	sendMessage = (messageData: MessageDto) => {
		const channel: any = this.client.channels.cache.get(this.test_server_channelId);
		const { author, textContent } = messageData.message;
		if (channel) {
			channel.send(`[${author}]: ${textContent}`);
		} else {
			console.error('Channel not found!');
		}
	};
	sendEmbed = (embedData: EmbedDto) => {
		const file = new AttachmentBuilder(embedData.filepath);
		const embed = new EmbedBuilder()
			.setTitle(embedData.caption)
			.setImage(`attachment://${embedData.filepath}`);

		const channel: any = this.client.channels.cache.get(this.test_server_channelId);
		channel.send({ embeds: [embed], files: [file] });
	};
}
