import { PostgrestClient } from "@supabase/postgrest-js";

// export const db = new PostgrestClient(process.env.REST_URL!);
export const db = new PostgrestClient("http://173.212.212.118:4001");
