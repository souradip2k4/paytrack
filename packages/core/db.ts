import { PostgrestClient } from "@supabase/postgrest-js";
import { authClient } from "./auth-client";

/**
 * Creates a new PostgrestClient instance configured with authorization headers.
 * This client is used to interact with the Supabase PostgREST API (Postgres REST endpoint).
 *
 * @param {string} token - The JWT (JSON Web Token) used for authorization.
 * @returns {PostgrestClient} A configured PostgrestClient instance.
 */
export const db = (token: string): PostgrestClient => {
	return new PostgrestClient(process.env.NEXT_PUBLIC_PG_REST_URL!, {
		headers: {
			ContentType: "application/json",
			Accept: "application/json",
			Authorization: `Bearer ${token}`,
		},
	});
};

/**
 * Asynchronously fetches the current user's JWT and then creates a PostgrestClient
 * instance with that token for authorized database access.
 *
 * @async
 * @returns {Promise<PostgrestClient>} A promise that resolves to a configured PostgrestClient instance.
 * @throws {Error} Throws an error if fetching the authorization token fails.
 */
export const getDb = async (): Promise<PostgrestClient> => {
	const { data, error } = await authClient.token();
	if (error) {
		throw error;
	}
	return new PostgrestClient(process.env.NEXT_PUBLIC_PG_REST_URL!, {
		headers: {
			ContentType: "application/json",
			Accept: "application/json",
			Authorization: `Bearer ${data.token}`,
		},
	});
};
