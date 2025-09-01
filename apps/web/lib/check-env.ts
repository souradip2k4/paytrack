export const checkEnv = (env: string) => {
	if (!process.env[env]) throw new Error(`env: ${env} is not set`);
};
