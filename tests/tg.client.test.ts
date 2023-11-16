// Import necessary dependencies and modules
const { TelegramBot } = require('../src/bots/tg.bot.ts');
const EventEmitter = require('events');
require('dotenv').config();

// Mock TelegramBot for testing purposes
jest.mock('node-telegram-bot-api');

// Mock betaEmitter for testing purposes
const betaEmitter = new EventEmitter();

// Mock userChatIds and TelegramBot instance
const userChatIds: string[] = [];
const bot = new (require('node-telegram-bot-api'))();
const telegramBot = new TelegramBot(bot, betaEmitter, userChatIds, 'tgToken');

describe('Telegram Bot Tests Suite', () => {
	// Mock Telegram message for testing
	const mockTelegramMessage = {
		chat: { id: 123 },
		from: { first_name: 'TestUser' },
		text: 'Test message content',
	};

	// Mock Telegram document for testing
	const mockTelegramDocument = {
		chat: { id: 123 },
		from: { first_name: 'TestUser' },
		document: { file_id: 'mock_file_id' },
	};

	// Mock MessageDto for testing
	const mockMessageDto = {
		message: {
			author: 'TestUser',
			timestamp: Date.now(),
			textContent: 'Test message content',
		},
		receivingUsersIds: [456, 789],
	};

	// Mock EmbedDto for testing
	const mockEmbedDto = {
		filepath: 'mock_filepath',
		caption: 'Test caption',
		receivingUsersIds: [456, 789],
	};

	// Mock betaEmitter emit function for testing
	betaEmitter.emit = jest.fn();

	// Mock bot functions for testing
	bot.sendMessage = jest.fn();
	bot.sendDocument = jest.fn();
	bot.getFile = jest.fn(() => Promise.resolve({ file_path: 'mock_file_path' }));
	bot.getFileLink = jest.fn(() => 'mock_file_link');

	beforeEach(() => {
		// Clear mock function calls before each test
		jest.clearAllMocks();
	});

	describe('processNewMessage', () => {
		test('should process a new text message', () => {
			telegramBot.processNewMessage(mockTelegramMessage);
			expect(userChatIds).toContain(mockTelegramMessage.chat.id);
			expect(betaEmitter.emit).toHaveBeenCalledWith('sendTelegramMessage', expect.any(Object));
			expect(betaEmitter.emit).toHaveBeenCalledWith('sendDiscordMessage', expect.any(Object));
		});

		test('should process a new document message', async () => {
			await telegramBot.processNewMessage(mockTelegramDocument);
			expect(userChatIds).toContain(mockTelegramDocument.chat.id);
			expect(bot.sendDocument).toHaveBeenCalledTimes(userChatIds.length - 1);
			expect(betaEmitter.emit).toHaveBeenCalledWith('sendDiscordEmbed', expect.any(Object));
		});

		// Add more test cases as needed
	});

	describe('sendMessage', () => {
		test('should send a message to multiple users', () => {
			telegramBot.sendMessage(mockMessageDto);
			expect(bot.sendMessage).toHaveBeenCalledTimes(mockMessageDto.receivingUsersIds.length);
		});

		// Add more test cases as needed
	});

	describe('sendEmbed', () => {
		test('should send an embed to multiple users', () => {
			telegramBot.sendEmbed(mockEmbedDto);
			expect(bot.sendDocument).toHaveBeenCalledTimes(mockEmbedDto.receivingUsersIds.length);
		});

		// Add more test cases as needed
	});
});
