export const readEnvValue = (valueName: string): string => {
	console.log('valueName: ', valueName);
	const envValue = process.env[valueName];
	if (!envValue) {
		console.error(`No ${valueName} env value`);
		throw new Error(`No ${valueName} env value`);
	}
	return envValue;
};