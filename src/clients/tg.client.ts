import { SendEmbedEvent, Message, SendMessageEvent, TgSendMessageEvent, TgSendEmbedEvent, BetaEmitter } from '../types/common.js';

interface MessageDto extends TgSendMessageEvent { };
interface EmbedDto extends TgSendEmbedEvent { };

export class TgClient {
	bot: any;
	userChatIds: string[];
	betaEmitter: BetaEmitter;
	tgToken: string;

	constructor (bot: any, betaEmitter: any, userChatIds: any, tgToken: string) {
		this.bot = bot;
		this.betaEmitter = betaEmitter;
		this.userChatIds = userChatIds;
		this.tgToken = tgToken;
	}

	processNewMessage = (msg: any) => {
		const chatId = msg.chat.id;
		console.log('1. Telegram message: ', msg);

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
			this.betaEmitter.emit('sendTelegramMessage', { message: standardizedMsg, receivingUsersIds: this.userChatIds.filter((el: any) => el !== chatId) });
			this.betaEmitter.emit('sendDiscordMessage', { message: standardizedMsg });

		}
		if (msg.document) {
			this.userChatIds.filter((el: any) => el !== chatId).forEach((userId: string) => {
				this.bot.sendDocument(chatId, msg.document.file_id);
			});
			this.bot.getFile(msg.document.file_id)
				.then((fileInfo: any) => {
					console.log('getting file');

					// Get the file path
					const filePath = fileInfo.file_path;

					// Use the `getFileLink` method to get a direct link to the file
					const fileLink = this.bot.getFileLink(msg.document.file_id);

					const fileUrl = `https://api.telegram.org/file/bot${this.tgToken}/${filePath}`;
					console.log('fileUrl: ', fileUrl);

					// Log the file path and link (you can also use them as needed)
					console.log(`File Path: ${filePath}`);
					console.log(`File Link: ${fileLink}`);

					console.log('File url: ' + fileUrl);
					const caption = msg.caption ? `[${msg.from.first_name}]: ${msg.caption}` : `${msg.from.first_name} wysyła obrazek`;
					this.betaEmitter.emit('sendDiscordEmbed', { caption, filepath: fileUrl, timestamp: Date.now() });
				})
				.catch((getFileInfoError: any) => {
					console.error('Error getting file info:', getFileInfoError);
				});

		}
	};

	sendMessage = (messageDto: MessageDto) => {
		console.log('2. sendTelegramMessage', messageDto);
		const { author, textContent } = messageDto.message;

		messageDto.receivingUsersIds.forEach((userId: any) => {
			this.bot.sendMessage(userId, `[${author}]: ${textContent}`);
		});
	};
	sendEmbed = (embedDto: EmbedDto) => {
		console.log('2. sendTelegramEmbed', embedDto);
		embedDto.receivingUsersIds.forEach((userId: any) => {
			this.bot.sendDocument(userId, embedDto.filepath, { caption: embedDto.caption });
		});
	};
}