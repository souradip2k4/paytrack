import { PostgrestClient } from "@supabase/postgrest-js";

export const db = (headers: HeadersInit) => {
	// if (!process.env.REST_URL) throw new Error("env: REST_URL is not set");
	return new PostgrestClient("http://localhost:4001", { headers });
};
