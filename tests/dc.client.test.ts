import { DcClient } from '../clients/dc.client.ts';
import { BetaEmitter } from '../types/common.ts';


const betaEmitterMock: BetaEmitter = {
	emit: jest.fn(),
	on: jest.fn(),
	addListener: jest.fn(),
	once: jest.fn(),
	removeListener: jest.fn(),
	off: jest.fn(),
	removeAllListeners: jest.fn(),
	setMaxListeners: jest.fn(),
	getMaxListeners: jest.fn(),
	listeners: jest.fn(),
	rawListeners: jest.fn(),
	listenerCount: jest.fn(),
	prependListener: jest.fn(),
	prependOnceListener: jest.fn(),
	eventNames: jest.fn(),
};

const userChatIdsMock = ['user1', 'user2'];
const clientMock = {
	channels: {
		cache: {
			get: jest.fn().mockReturnValue({
				send: jest.fn(),
			}),
		},
	},
};



// Test Suite
describe('DcClient', () => {
	let dcClient: any;

	beforeEach(() => {
		dcClient = new DcClient(clientMock, betaEmitterMock, userChatIdsMock);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	// Test Case 1
	it('processAttachments should return processed attachments', () => {
		const author = 'testAuthor';
		const attachments = [{ url: 'attachment1' }, { url: 'attachment2' }];
		const result = dcClient.processAttachments(author, attachments);

		expect(result).toEqual([
			{ caption: 'testAuthor wysyła bobrazek', filepath: 'attachment1', timestamp: expect.any(Number) },
			{ caption: 'testAuthor wysyła bobrazek', filepath: 'attachment2', timestamp: expect.any(Number) },
		]);
	});

	// Test Case 2
	it('processNewMessage should emit events based on message content', () => {
		const discordMessage = {
			channelId: '1165277765881303161',
			author: { username: 'testAuthor' },
			content: 'Test message content',
		};

		dcClient.processNewMessage(discordMessage);

		expect(betaEmitterMock.emit).toHaveBeenCalledWith('sendTelegramMessage', {
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

		dcClient.sendMessage(messageDto);

		expect(clientMock.channels.cache.get).toHaveBeenCalledWith('1159097400506454019');

		expect(clientMock.channels.cache.get('1159097400506454019').send).toHaveBeenCalledWith('[testAuthor]: Test message content');
	});

	it('sendEmbed should send an embed message to Discord channel', () => {
		const embedDto = {
			client: clientMock,
			caption: 'Test Embed Caption',
			filepath: 'testFilePath',
		};

		dcClient.sendEmbed(embedDto);

		expect(clientMock.channels.cache.get).toHaveBeenCalledWith('1159097400506454019');

		expect(clientMock.channels.cache.get('1159097400506454019').send).toHaveBeenCalled();
		// Add more test cases as needed
	});
});