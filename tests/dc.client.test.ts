import { DiscordBot } from '../src/bots/dc.bot.ts';
import { readEnvValue } from '../src/services/readEnvValue.service.ts';
import { BetaEmitter } from '../src/types/common.ts';
require('dotenv').config();
const EventEmitter = require('events');


const betaEmitter = new EventEmitter();


const userChatIdsMock = ['user1', 'user2'];



// Test Suite
describe('discordBot', () => {
	let discordBot: any;
	betaEmitter.emit = jest.fn();
	const clientMock = {
		channels: {
			cache: {
				get: jest.fn().mockReturnValue({
					send: jest.fn(),
				}),
			},
		},
		user: {
			id: '123'
		}
	};

	beforeEach(() => {
		discordBot = new DiscordBot(clientMock, betaEmitter, userChatIdsMock);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	// Test Case 1
	it('processAttachments should return processed attachments', () => {
		const author = 'testAuthor';
		const attachments = [{ url: 'attachment1' }, { url: 'attachment2' }];
		const result = discordBot.processAttachments(author, attachments);

		expect(result).toEqual([
			{ caption: 'testAuthor wysyła bobrazek', filepath: 'attachment1', timestamp: expect.any(Number) },
			{ caption: 'testAuthor wysyła bobrazek', filepath: 'attachment2', timestamp: expect.any(Number) },
		]);
	});

	// Test Case 2
	it('processNewMessage should emit events based on message content', () => {
		const discordMessage = {
			channelId: readEnvValue('DISCORD_CHANNEL'),
			author: { username: 'testAuthor', id: '100' },
			content: 'Test message content',
		};

		discordBot.processNewMessage(discordMessage);
		expect(betaEmitter.emit).toHaveBeenCalledWith('sendTelegramMessage', expect.any(Object));

		expect(betaEmitter.emit).toHaveBeenCalledWith('sendTelegramMessage', {
			message: {
				author: 'testAuthor',
				timestamp: expect.any(Number),
				textContent: 'Test message content',
			},
			receivingUsersIds: userChatIdsMock,
		});
	});
	it('sendMessage should send a text message to Discord channel', () => {
		const messageDto = {
			client: clientMock,
			message: {
				author: 'testAuthor',
				timestamp: Date.now(),
				textContent: 'Test message content',
			},
		};

		discordBot.sendMessage(messageDto);

		expect(clientMock.channels.cache.get).toHaveBeenCalledWith('1159097400506454019');

		expect(clientMock.channels.cache.get('1159097400506454019').send).toHaveBeenCalledWith('[testAuthor]: Test message content');
	});

	it('sendEmbed should send an embed message to Discord channel', () => {
		const embedDto = {
			client: clientMock,
			caption: 'Test Embed Caption',
			filepath: 'testFilePath',
		};

		discordBot.sendEmbed(embedDto);

		expect(clientMock.channels.cache.get).toHaveBeenCalledWith('1159097400506454019');

		expect(clientMock.channels.cache.get('1159097400506454019').send).toHaveBeenCalled();
		// Add more test cases as needed
	});
});