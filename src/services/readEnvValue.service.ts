export const readEnvValue = (valueName: string): string => {
	const envValue = process.env[valueName];
	if (!envValue) {
		console.error(`No ${valueName} env value`);
		process.exit(1);
	}
	return envValue;
};