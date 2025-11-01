import { Pool, type PoolConfig } from "pg";

declare global {
	var __pg_auth_admin_client__: Pool;
	var __pg_subscription_admin_client__: Pool;
}

const sharedConfig: PoolConfig = {
	max: process.env.NODE_ENV === "production" ? 5 : 20,
	idleTimeoutMillis: 50_000,
	connectionTimeoutMillis: 2500,
};

export const getAuthAdminClient = () => {
	try {
		const connection = new Pool({
			database: process.env.POSTGRES_DATABASE,
			host: process.env.POSTGRES_HOST,
			port: Number(process.env.POSTGRES_PORT),
			user: process.env.POSTGRES_AUTH_ADMIN_USER,
			password: process.env.POSTGRES_AUTH_ADMIN_PASSWORD,
			...sharedConfig,
		});
		return connection;
	} catch (e) {
		console.log(e);
	}
	/*
	if (!global.__pg_auth_admin_client__) {
		global.__pg_auth_admin_client__ = new Pool({
			database: process.env.POSTGRES_DATABASE,
			user: process.env.POSTGRES_AUTH_ADMIN_USER,
			password: process.env.POSTGRES_AUTH_ADMIN_USER,
			...sharedConfig,
		});
	}
	return global.__pg_auth_admin_client__;*/
};

export const getSubscriptionAdminClient = () => {
	try {
		const connection = new Pool({
			database: process.env.POSTGRES_DATABASE,
			host: process.env.POSTGRES_HOST,
			port: Number(process.env.POSTGRES_PORT),
			user: process.env.POSTGRES_SUBSCRIPTION_ADMIN_USER,
			password: process.env.POSTGRES_SUBSCRIPTION_ADMIN_PASSWORD,
			...sharedConfig,
		});
		return connection;
	} catch (e) {
		console.log(e);
	}

	/*
	if (!global.__pg_subscription_admin_client__) {
		global.__pg_subscription_admin_client__ = new Pool({
			database: process.env.POSTGRES_DATABASE,
			user: process.env.POSTGRES_SUBSCRIPTION_ADMIN_USER,
			password: process.env.POSTGRES_SUBSCRIPTION_ADMIN_PASSWORD,
			...sharedConfig,
		});
	}
	return global.__pg_subscription_admin_client__;*/
};
