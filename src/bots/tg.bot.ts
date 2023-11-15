import { Message, TgSendMessageEvent, TgSendEmbedEvent, BetaEmitter } from '../types/common.js';

interface MessageDto extends TgSendMessageEvent { };
interface EmbedDto extends TgSendEmbedEvent { };

export class TelegramBot {
	client: any;
	userChatIds: string[];
	betaEmitter: BetaEmitter;
	tgToken: string;

	constructor (client: any, betaEmitter: any, userChatIds: any, tgToken: string) {
		this.client = client;
		this.betaEmitter = betaEmitter;
		this.userChatIds = userChatIds;
		this.tgToken = tgToken;
	}

	processNewMessage = (msg: any) => {
		const chatId = msg.chat.id;

		// Check if the user's chat ID is not in the array, add it
		if (!this.userChatIds.includes(chatId)) {
			this.userChatIds.push(chatId);
		}
		if (msg.from.first_name === 'przeklejacz_bot') {// add regex here to check if
			return true;
		}
		if (msg.text && msg.text.length < 9000) {
			const standardizedMsg: Message = {
				author: msg.from.first_name,
				timestamp: Date.now(),
				textContent: msg.text
			};
			console.log('Processing Telegram text message:', standardizedMsg);
			this.betaEmitter.emit('sendTelegramMessage', { message: standardizedMsg, receivingUsersIds: this.userChatIds.filter((el: any) => el !== chatId) });
			this.betaEmitter.emit('sendDiscordMessage', { message: standardizedMsg });

		}
		if (msg.document) {
			this.userChatIds.filter((el: any) => el !== chatId).forEach((userId: string) => {
				this.client.sendDocument(chatId, msg.document.file_id);
			});
			this.client.getFile(msg.document.file_id)
				.then((fileInfo: any) => {
					const filePath = fileInfo.file_path;
					const fileUrl = `https://api.telegram.org/file/bot${this.tgToken}/${filePath}`;

					const caption = msg.caption ? `[${msg.from.first_name}]: ${msg.caption}` : `${msg.from.first_name} wysyła obrazek`;
					this.betaEmitter.emit('sendDiscordEmbed', { caption, filepath: fileUrl, timestamp: Date.now() });
				})
				.catch((getFileInfoError: any) => {
					console.error('Error getting file info:', getFileInfoError);
				});

		}
	};

	sendMessage = (messageDto: MessageDto) => {
		console.log('Sending telegram message:', messageDto);
		const { author, textContent } = messageDto.message;

		messageDto.receivingUsersIds.forEach((userId: any) => {
			this.client.sendMessage(userId, `[${author}]: ${textContent}`);
		});
	};
	sendEmbed = (embedDto: EmbedDto) => {
		console.log('Sending telegram embed:', embedDto);
		embedDto.receivingUsersIds.forEach((userId: any) => {
			this.client.sendDocument(userId, embedDto.filepath, { caption: embedDto.caption });
		});
	};
}