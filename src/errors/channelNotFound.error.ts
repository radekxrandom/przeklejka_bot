const ErrorMessages = {
	ChannelNotFound: 'Channel not found!',
	// Add other error messages as needed
};

export class ChannelNotFoundError extends Error {
	constructor (message: string) {
		super(message);
		this.name = 'ChannelNotFoundError';
	}
}
