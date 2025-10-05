import { PostgrestClient } from "@supabase/postgrest-js";

export const db = (headers: HeadersInit) => {
	return new PostgrestClient(process.env.NEXT_PUBLIC_PG_REST_URL!, {
		headers,
	});
};
