import { useQuery } from "@tanstack/react-query";
import { authClient } from "./auth-client";
import { bearerHeader } from "./bearer";
import { db } from "./db";

export const useCategories = () => {
	const { data } = authClient.useSession();
	const query = useQuery({
		queryKey: ["cat", "get", data?.user?.id],
		queryFn: async () => {
			if (!data || !data.user.id) return [];
			const res = await db(await bearerHeader())
				.from("categories")
				.select("*")
				.eq("user_id", data.user.id)
				.order("name");
			if (res.error) return [];
			return res.data;
		},
	});
	return query;
};
